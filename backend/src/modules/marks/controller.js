const { supabase } = require('../../config/supabase');

const enterBulkMarks = async (req, res, next) => {
  const { exam_id, marks } = req.body; // marks: [{ student_id, score, remarks }]

  try {
    // Validate exam existence and not locked
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('max_score, is_locked')
      .eq('id', exam_id)
      .single();

    if (examError || !exam) return res.status(404).json({ success: false, error: { message: 'Exam not found' } });
    if (exam.is_locked) return res.status(403).json({ success: false, error: { message: 'Exam is locked for edits' } });

    const marksToInsert = marks.map(m => {
      // Compute grade (simplified)
      let grade = 'F';
      const pct = (m.score / exam.max_score) * 100;
      if (pct >= 80) grade = 'A';
      else if (pct >= 65) grade = 'B';
      else if (pct >= 50) grade = 'C';
      else if (pct >= 40) grade = 'D';

      return {
        exam_id,
        student_id: m.student_id,
        score: m.score,
        grade,
        remarks: m.remarks,
        entered_by: req.user.id
      };
    });

    const { data, error } = await supabase
      .from('marks')
      .upsert(marksToInsert, { onConflict: 'student_id,exam_id' });

    if (error) throw error;

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
    let query = supabase.from('marks').select('*, students(full_name, student_number)');
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
