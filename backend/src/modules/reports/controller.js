const { supabaseAdmin } = require('../../config/supabase');
const { generateStudentResultPDF } = require('../../utils/pdf/studentResult.pdf');

const getStudentReport = async (req, res, next) => {
  const { student_id, class_id, term_id } = req.body;
  try {
    // 1. Fetch student profile
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('*, schools(name), classes(name)')
      .eq('id', student_id)
      .single();

    if (studentError) throw studentError;

    // 2. Fetch overall result
    const { data: result, error: resultError } = await supabaseAdmin
      .from('student_results')
      .select('*')
      .eq('student_id', student_id)
      .eq('class_id', class_id)
      .eq('term_id', term_id)
      .single();

    if (!result) return res.status(404).json({ success: false, error: { message: 'Result not found for this student/term' } });

    // Get student count for position display
    const { count: studentCount } = await supabaseAdmin
      .from('student_results')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', class_id)
      .eq('term_id', term_id);
    
    result.student_count = studentCount;

    // 3. Fetch subject aggregates
    const { data: aggregates, error: aggregatesError } = await supabaseAdmin
      .from('subject_aggregates')
      .select('*, subjects(name, code)')
      .eq('student_id', student_id)
      .eq('term_id', term_id);

    // 4. Fetch all exams for the class + term
    const { data: exams, error: examsError } = await supabaseAdmin
      .from('exams')
      .select('id, name, subject_id, exam_type, sequence_no, max_score')
      .eq('class_id', class_id)
      .eq('term_id', term_id)
      .order('sequence_no', { ascending: true });

    // 5. Fetch all marks for the student
    const { data: marks, error: marksError } = await supabaseAdmin
      .from('marks')
      .select('*')
      .eq('student_id', student_id)
      .in('exam_id', exams.map(e => e.id));

    // Fetch term info
    const { data: term } = await supabaseAdmin
      .from('academic_terms')
      .select('*')
      .eq('id', term_id)
      .single();
    
    result.term_name = term ? `Term ${term.term_number}, ${term.year}` : 'N/A';

    // Fetch section info
    const { data: section } = await supabaseAdmin
      .from('sections')
      .select('name')
      .eq('id', student.classes.section_id)
      .single();
    
    student.section_name = section ? section.name : 'N/A';

    const filename = `${student.full_name.replace(/[^a-z0-9]/gi, '_')}_${student.classes.name.replace(/ /g, '_')}_Term${term?.term_number || 'X'}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    generateStudentResultPDF({ student, result, aggregates, exams, marks }, res);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudentReport };
