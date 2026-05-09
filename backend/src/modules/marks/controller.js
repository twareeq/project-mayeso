const { supabaseAdmin } = require('../../config/supabase');
const { recomputeStudentResult } = require('./aggregation.service');

const enterBulkMarks = async (req, res, next) => {
  const { exam_id, marks } = req.body; // marks: [{ student_id, score, is_absent }]

  try {
    // Validate exam existence and not locked
    const { data: exam, error: examError } = await supabaseAdmin
      .from('exams')
      .select('id, class_id, term_id, max_score, is_locked')
      .eq('id', exam_id)
      .single();

    if (examError || !exam) return res.status(404).json({ success: false, error: { message: 'Exam not found' } });
    if (exam.is_locked) return res.status(403).json({ success: false, error: { message: 'Exam is locked for edits' } });

    const marksToInsert = marks.map(m => {
      return {
        exam_id,
        student_id: m.student_id,
        score: m.is_absent ? 0 : m.score,
        is_absent: !!m.is_absent,
        entered_by: req.user.id,
        updated_at: new Date().toISOString()
      };
    });

    const { data, error } = await supabaseAdmin
      .from('marks')
      .upsert(marksToInsert, { onConflict: 'student_id,exam_id' });

    if (error) throw error;

    // Trigger recomputation for each student affected
    // In a real production system, this should be a background job or a database trigger
    for (const m of marksToInsert) {
      await recomputeStudentResult(m.student_id, exam.class_id, exam.term_id);
    }

    res.json({
      success: true,
      data: { count: marksToInsert.length }
    });
  } catch (err) {
    next(err);
  }
};

const getMarks = async (req, res, next) => {
  const { exam_id, class_id } = req.query;
  try {
    let query = supabaseAdmin.from('marks').select('*, students(full_name, student_number)');
    if (exam_id) query = query.eq('exam_id', exam_id);
    // If class_id provided, we might need a join or filter by student's class
    if (class_id) {
       // This would need a more complex query if marks table doesn't have class_id
       // But we can filter students by class_id
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { enterBulkMarks, getMarks };
