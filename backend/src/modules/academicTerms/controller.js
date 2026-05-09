const { supabaseAdmin } = require('../../config/supabase');

const listTerms = async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('academic_terms')
      .select('*')
      .order('year', { ascending: false })
      .order('term_number', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const createTerm = async (req, res, next) => {
  const { year, term_number, start_date, end_date, is_current } = req.body;
  try {
    if (is_current) {
      // Set all other terms to not current
      await supabaseAdmin.from('academic_terms').update({ is_current: false }).eq('is_current', true);
    }

    const { data, error } = await supabaseAdmin
      .from('academic_terms')
      .insert({ year, term_number, start_date, end_date, is_current })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { listTerms, createTerm };
