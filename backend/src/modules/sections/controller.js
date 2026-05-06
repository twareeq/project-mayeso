const { supabase } = require('../../config/supabase');

exports.listSections = async (req, res, next) => {
  try {
    const school_id = req.user.school_id;
    if (!school_id && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, error: { message: 'User is not assigned to a school' }});
    }

    let query = supabase.from('sections').select('*');
    if (school_id) {
      query = query.eq('school_id', school_id);
    }
    
    const { data, error } = await query.order('name');
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.createSection = async (req, res, next) => {
  try {
    const { name } = req.body;
    const school_id = req.user.school_id;
    
    if (!name) return res.status(400).json({ success: false, error: { message: 'Section name is required' }});
    if (!school_id) return res.status(400).json({ success: false, error: { message: 'User must belong to a school' }});

    const { data, error } = await supabase
      .from('sections')
      .insert([{ name, school_id }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ success: false, error: { message: 'Section already exists in this school' }});
      throw error;
    }

    req.auditData = { entityId: data.id, newValue: data };
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.deleteSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First fetch to store old value for audit
    const { data: section } = await supabase.from('sections').select('*').eq('id', id).single();
    if (!section) return res.status(404).json({ success: false, error: { message: 'Section not found' }});

    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') return res.status(409).json({ success: false, error: { message: 'Cannot delete section with existing classes' }});
      throw error;
    }

    req.auditData = { entityId: id, oldValue: section };
    res.json({ success: true, data: { id } });
  } catch (err) {
    next(err);
  }
};
