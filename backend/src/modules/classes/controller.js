const { supabase } = require('../../config/supabase');

exports.listClasses = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    // We join with sections to ensure we only get classes for this school
    let query = supabase.from('classes').select('*, sections!inner(*)');
    if (school_id) {
      query = query.eq('sections.school_id', school_id);
    }
    
    const { data, error } = await query.order('name');
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.createClass = async (req, res, next) => {
  try {
    const { name, section_id, academic_year } = req.body;
    
    if (!name || !section_id || !academic_year) {
      return res.status(400).json({ success: false, error: { message: 'Missing required fields' }});
    }

    // Verify section belongs to user's school
    const { data: section } = await supabase.from('sections').select('school_id').eq('id', section_id).single();
    if (!section || (req.user.role !== 'admin' && section.school_id !== req.user.school_id)) {
      return res.status(403).json({ success: false, error: { message: 'Invalid section or permission denied' }});
    }

    const { data, error } = await supabase
      .from('classes')
      .insert([{ name, section_id, academic_year }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, error: { message: 'Class name already exists in this section for the given year' }});
      throw error;
    }

    req.auditData = { entityId: data.id, newValue: data };
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: cls } = await supabase.from('classes').select('*, sections!inner(*)').eq('id', id).single();
    if (!cls || (req.user.role !== 'admin' && cls.sections.school_id !== req.user.school_id)) {
      return res.status(404).json({ success: false, error: { message: 'Class not found' }});
    }

    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') return res.status(409).json({ success: false, error: { message: 'Cannot delete class with existing students or subjects' }});
      throw error;
    }

    req.auditData = { entityId: id, oldValue: cls };
    res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
};
