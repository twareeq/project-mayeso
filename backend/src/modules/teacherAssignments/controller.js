const { supabaseAdmin } = require('../../config/supabase');

exports.listAssignments = async (req, res, next) => {
  try {
    let query = supabaseAdmin.from('teacher_assignments').select(`
      *,
      profiles:profiles!teacher_assignments_teacher_id_fkey(full_name, email),
      classes!inner(id, name, sections!inner(school_id)),
      subjects(id, name, code)
    `);

    // If teacher, only see own assignments. If head_teacher, see all in school.
    if (req.user.role === 'teacher') {
      query = query.eq('teacher_id', req.user.id);
    } else if (req.user.school_id) {
      query = query.eq('classes.sections.school_id', req.user.school_id);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Clean up nulls from inner joins that failed due to RLS/filtering
    const cleaned = data.filter(a => a.classes).map(a => ({
      ...a,
      school_id: a.classes.sections?.school_id
    }));

    res.json({ success: true, data: cleaned });
  } catch (err) {
    next(err);
  }
};

exports.assignTeacher = async (req, res, next) => {
  try {
    const { teacher_id, class_id, subject_id, academic_year } = req.body;
    
    if (!teacher_id || !class_id || !subject_id || !academic_year) {
      return res.status(400).json({ success: false, error: { message: 'Missing required fields' }});
    }

    // Insert
    const { data, error } = await supabaseAdmin
      .from('teacher_assignments')
      .insert([{ teacher_id, class_id, subject_id, academic_year, assigned_by: req.user.id }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, error: { message: 'Teacher is already assigned to this class and subject for the given year' }});
      throw error;
    }

    req.auditData = { entityId: data.id, newValue: data };
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.removeAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: assignment } = await supabaseAdmin.from('teacher_assignments').select('*, classes!inner(sections!inner(school_id))').eq('id', id).single();
    
    if (!assignment || (req.user.role !== 'admin' && assignment.classes.sections.school_id !== req.user.school_id)) {
      return res.status(404).json({ success: false, error: { message: 'Assignment not found' }});
    }

    const { error } = await supabaseAdmin.from('teacher_assignments').delete().eq('id', id);
    if (error) throw error;

    req.auditData = { entityId: id, oldValue: assignment };
    res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
};
