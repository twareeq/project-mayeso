const { supabase } = require('../../config/supabase');

exports.listSubjects = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    let query = supabase.from('subjects').select('*, classes!inner(name, sections!inner(school_id))');
    if (school_id) {
      query = query.eq('classes.sections.school_id', school_id);
    }
    
    const { data, error } = await query.order('name');
    if (error) throw error;
    
    // Clean up the nested response structure
    const cleaned = data.map(sub => ({
      ...sub,
      class_name: sub.classes?.name,
      school_id: sub.classes?.sections?.school_id
    }));

    res.json({ success: true, data: cleaned });
  } catch (err) {
    next(err);
  }
};

exports.createSubject = async (req, res, next) => {
  try {
    const { name, code, class_id } = req.body;
    
    if (!name || !code || !class_id) {
      return res.status(400).json({ success: false, error: { message: 'Missing required fields' }});
    }

    const { data: cls } = await supabase.from('classes').select('sections(school_id)').eq('id', class_id).single();
    if (!cls || (req.user.role !== 'admin' && cls.sections.school_id !== req.user.school_id)) {
      return res.status(403).json({ success: false, error: { message: 'Invalid class or permission denied' }});
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert([{ name, code, class_id }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, error: { message: 'Subject code already exists' }});
      throw error;
    }

    req.auditData = { entityId: data.id, newValue: data };
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: subject } = await supabase.from('subjects').select('*, classes!inner(sections!inner(school_id))').eq('id', id).single();
    if (!subject || (req.user.role !== 'admin' && subject.classes.sections.school_id !== req.user.school_id)) {
      return res.status(404).json({ success: false, error: { message: 'Subject not found' }});
    }

    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) throw error;

    req.auditData = { entityId: id, oldValue: subject };
    res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
};
