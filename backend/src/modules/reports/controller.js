const { supabase } = require('../../config/supabase');
const { generateStudentReport } = require('../../utils/pdf');

const getStudentReport = async (req, res, next) => {
  const { student_id } = req.body;
  try {
    // Fetch student and marks
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*, schools(name), classes(name)')
      .eq('id', student_id)
      .single();

    if (studentError) throw studentError;

    const { data: marks, error: marksError } = await supabase
      .from('marks')
      .select('*, exams(subjects(name))')
      .eq('student_id', student_id);

    if (marksError) throw marksError;

    const reportData = {
      school_name: student.schools.name,
      student_name: student.full_name,
      student_number: student.student_number,
      class_name: student.classes.name,
      marks: marks.map(m => ({
        subject: m.exams.subjects.name,
        score: m.score,
        grade: m.grade,
        remarks: m.remarks
      }))
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${student.student_number}.pdf`);

    generateStudentReport(reportData, res);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudentReport };
