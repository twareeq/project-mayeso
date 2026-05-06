const { supabaseAdmin } = require('../../config/supabase');

const listStudents = async (req, res, next) => {
  const { class_id, school_id } = req.query;
  
  try {
    let query = supabaseAdmin.from('students').select('*, classes(name)', { count: 'exact' });

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
    // Generate student number: {school_code}-{year}-{sequence}
    const year = new Date().getFullYear();
    const { data: school } = await supabaseAdmin.from('schools').select('code').eq('id', school_id).single();
    const prefix = school?.code || 'SCH';

    // Get the current count to use as a base sequence
    const { count, error: countError } = await supabaseAdmin
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', school_id);
    
    if (countError) throw countError;

    // Use count + 1, but add a small random suffix to prevent collisions
    const sequence = (count + 1).toString().padStart(4, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const student_number = `${prefix}-${year}-${sequence}-${random}`;

    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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
