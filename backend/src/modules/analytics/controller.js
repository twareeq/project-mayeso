const { supabase } = require('../../config/supabase');

const getStudentPerformance = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data: marks, error } = await supabase
      .from('marks')
      .select('*, exams(name, exam_date, subjects(name))')
      .eq('student_id', id)
      .order('entered_at', { ascending: true });

    if (error) throw error;

    // Transform for charts
    const performance = marks.map(m => ({
      exam: m.exams.name,
      date: m.exams.exam_date,
      subject: m.exams.subjects.name,
      score: m.score,
      grade: m.grade
    }));

    res.json({ success: true, data: performance });
  } catch (err) {
    next(err);
  }
};

const getClassSummary = async (req, res, next) => {
  const { id } = req.params; // class_id
  try {
    // Average score per subject for this class
    const { data, error } = await supabase
      .rpc('get_class_subject_averages', { class_uuid: id });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getAtRiskStudents = async (req, res, next) => {
  const { schoolId } = req.params;
  try {
    // In a real app, this would be a complex join or a materialized view.
    // For this prototype, we'll fetch students and then filter.
    const { data: students, error } = await supabase
      .from('students')
      .select('*, classes(name)')
      .eq('school_id', schoolId);

    if (error) throw error;

    // Fetch averages for these students
    const { data: marks, error: marksError } = await supabase
      .from('marks')
      .select('student_id, score');
    
    if (marksError) throw marksError;

    // Fetch attendance for these students
    const { data: attendance, error: attError } = await supabase
      .from('attendance')
      .select('student_id, status');
    
    if (attError) throw attError;

    const atRisk = students.map(s => {
      const studentMarks = marks.filter(m => m.student_id === s.id);
      const avgScore = studentMarks.length ? studentMarks.reduce((acc, m) => acc + m.score, 0) / studentMarks.length : 100;
      
      const studentAtt = attendance.filter(a => a.student_id === s.id);
      const attRate = studentAtt.length ? (studentAtt.filter(a => a.status === 'present').length / studentAtt.length) * 100 : 100;

      let riskReason = [];
      if (avgScore < 40) riskReason.push('Score below 40%');
      if (attRate < 75) riskReason.push('Attendance below 75%');

      return {
        ...s,
        avgScore,
        attRate,
        riskReason: riskReason.join(' & ')
      };
    }).filter(s => s.riskReason);

    res.json({ success: true, data: atRisk });
  } catch (err) {
    next(err);
  }
};

const getAttendanceTrend = async (req, res, next) => {
  const { id } = req.params; // class_id
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('attendance')
      .select('date, status')
      .eq('class_id', id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

    if (error) throw error;

    // Group by date
    const grouped = data.reduce((acc, curr) => {
      if (!acc[curr.date]) acc[curr.date] = { date: curr.date, total: 0, present: 0 };
      acc[curr.date].total++;
      if (curr.status === 'present') acc[curr.date].present++;
      return acc;
    }, {});

    const trend = Object.values(grouped).map(g => ({
      date: g.date,
      rate: (g.present / g.total) * 100
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ success: true, data: trend });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStudentPerformance, getClassSummary, getAtRiskStudents, getAttendanceTrend };
