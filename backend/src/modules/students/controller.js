const { supabase } = require('../../config/supabase');

const listStudents = async (req, res, next) => {
  const { class_id, school_id } = req.query;
  
  try {
    let query = supabase.from('students').select('*', { count: 'exact' });

    if (class_id) query = query.eq('class_id', class_id);
    if (school_id) query = query.eq('school_id', school_id);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data,
      meta: { total: count }
    });
  } catch (err) {
    next(err);
  }
};

const registerStudent = async (req, res, next) => {
  const { full_name, date_of_birth, gender, class_id, school_id } = req.body;

  try {
    // Generate student number: {school_code}-{year}-{4-digit-sequence}
    // For now, let's just use a simple random one or query last count.
    // In a real system, this would be more robust.
    const year = new Date().getFullYear();
    const { data: countData } = await supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', school_id);
    const sequence = (countData ? countData.length + 1 : 1).toString().padStart(4, '0');
    const student_number = `SCH-${year}-${sequence}`;

    const { data, error } = await supabase
      .from('students')
      .insert({
        student_number,
        full_name,
        date_of_birth,
        gender,
        class_id,
        school_id,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

const getStudentById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*, classes(name, sections(school_id, schools(name)))')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { listStudents, registerStudent, getStudentById };
