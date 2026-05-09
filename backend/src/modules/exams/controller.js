const { supabaseAdmin } = require('../../config/supabase');

const listExams = async (req, res, next) => {
  const { class_id, subject_id, term_id } = req.query;
  try {
    let query = supabaseAdmin.from('exams').select('*, subjects(id, name), classes(id, name)');
    if (class_id) query = query.eq('class_id', class_id);
    if (subject_id) query = query.eq('subject_id', subject_id);
    if (term_id) query = query.eq('term_id', term_id);

    const { data, error } = await query.order('sequence_no', { ascending: true }).order('exam_date', { ascending: false });
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const createExam = async (req, res, next) => {
  const { name, type, exam_date, max_score, class_id, subject_id, term_id, sequence_no } = req.body;
  try {
    const { data, error } = await supabaseAdmin
      .from('exams')
      .insert({
        name,
        exam_type: type,
        exam_date,
        max_score,
        class_id,
        subject_id,
        term_id,
        sequence_no: sequence_no || 1,
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

const toggleExamLock = async (req, res, next) => {
  const { id } = req.params;
  const { is_locked } = req.body;
  try {
    // Only Head Teacher or Admin should be able to lock/unlock
    if (!['head_teacher', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: { message: 'Unauthorized' } });
    }

    const { data, error } = await supabaseAdmin
      .from('exams')
      .update({ is_locked })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { listExams, createExam, toggleExamLock };
