const { supabaseAdmin } = require('../../config/supabase');

const getStudentResult = async (req, res, next) => {
  const { studentId } = req.params;
  const { termId, classId } = req.query;

  try {
    // 1. Get student profile
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('*, classes(name), schools(name)')
      .eq('id', studentId)
      .single();

    if (studentError) throw studentError;

    // 2. Get overall result
    const { data: result, error: resultError } = await supabaseAdmin
      .from('student_results')
      .select('*')
      .eq('student_id', studentId)
      .eq('term_id', termId)
      .eq('class_id', classId)
      .single();

    // 3. Get subject aggregates
    const { data: aggregates, error: aggregatesError } = await supabaseAdmin
      .from('subject_aggregates')
      .select('*, subjects(name, code)')
      .eq('student_id', studentId)
      .eq('term_id', termId);

    // 4. Get all exams for this class + term to show in breakdown
    const { data: exams, error: examsError } = await supabaseAdmin
      .from('exams')
      .select('id, name, subject_id, max_score, sequence_no')
      .eq('class_id', classId)
      .eq('term_id', termId)
      .order('sequence_no', { ascending: true });

    // 5. Get all marks for this student
    const { data: marks, error: marksError } = await supabaseAdmin
      .from('marks')
      .select('*')
      .eq('student_id', studentId)
      .in('exam_id', exams.map(e => e.id));

    res.json({
      success: true,
      data: {
        student,
        result,
        aggregates,
        exams,
        marks
      }
    });
  } catch (err) {
    next(err);
  }
};

const getClassResults = async (req, res, next) => {
  const { classId } = req.params;
  const { termId } = req.query;

  try {
    const { data, error } = await supabaseAdmin
      .from('student_results')
      .select('*, students(full_name, student_number)')
      .eq('class_id', classId)
      .eq('term_id', termId)
      .order('class_position', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const updateRemarks = async (req, res, next) => {
  const { resultId } = req.params;
  const { teacher_remarks } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('student_results')
      .update({ teacher_remarks })
      .eq('id', resultId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudentResult, getClassResults, updateRemarks };
