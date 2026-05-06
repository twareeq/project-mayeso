const { supabase } = require('../../config/supabase');

const listExams = async (req, res, next) => {
  const { class_id, subject_id } = req.query;
  try {
    let query = supabase.from('exams').select('*, subjects(name), classes(name)');
    if (class_id) query = query.eq('class_id', class_id);
    if (subject_id) query = query.eq('subject_id', subject_id);

    const { data, error } = await query.order('exam_date', { ascending: false });
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const createExam = async (req, res, next) => {
  const { name, type, exam_date, max_score, class_id, subject_id } = req.body;
  try {
    const { data, error } = await supabase
      .from('exams')
      .insert({
        name,
        type,
        exam_date,
        max_score,
        class_id,
        subject_id,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { listExams, createExam };
