const { supabaseAdmin } = require('../../config/supabase');

const listSchools = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('schools')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

const getSchoolById = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('schools')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

const createSchool = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('schools')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listSchools,
  getSchoolById,
  createSchool
};
