const { supabase } = require('../../config/supabase');

const markBulkAttendance = async (req, res, next) => {
  const { class_id, date, attendance } = req.body; // attendance: [{ student_id, status }]

  try {
    const recordsToInsert = attendance.map(a => ({
      student_id: a.student_id,
      class_id,
      date,
      status: a.status,
      marked_by: req.user.id
    }));

    const { data, error } = await supabase
      .from('attendance')
      .upsert(recordsToInsert, { onConflict: 'student_id,date' });

    if (error) throw error;

    res.json({
      success: true,
      data: { count: recordsToInsert.length }
    });
  } catch (err) {
    next(err);
  }
};

const getAttendance = async (req, res, next) => {
  const { class_id, date, student_id } = req.query;
  try {
    let query = supabase.from('attendance').select('*, students(full_name)');
    if (class_id) query = query.eq('class_id', class_id);
    if (date) query = query.eq('date', date);
    if (student_id) query = query.eq('student_id', student_id);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { markBulkAttendance, getAttendance };
