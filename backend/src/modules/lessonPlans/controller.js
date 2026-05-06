const { supabaseAdmin } = require('../../config/supabase');

const createLessonPlan = async (req, res, next) => {
  const { class_id, subject_id, title, content, week_number, academic_year } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('lesson_plans')
      .insert({
        teacher_id: req.user.id,
        class_id,
        subject_id,
        title,
        content,
        week_number,
        academic_year,
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const submitLessonPlan = async (req, res, next) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabaseAdmin
      .from('lesson_plans')
      .update({ status: 'submitted', submitted_at: new Date() })
      .eq('id', id)
      .eq('teacher_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const reviewLessonPlan = async (req, res, next) => {
  const { id } = req.params;
  const { status, review_notes } = req.body; // 'reviewed' or 'rejected'

  try {
    const { data, error } = await supabaseAdmin
      .from('lesson_plans')
      .update({
        status,
        review_notes,
        reviewed_by: req.user.id,
        reviewed_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const listLessonPlans = async (req, res, next) => {
  try {
    let query = supabaseAdmin.from('lesson_plans').select('*, classes(name), subjects(name), profiles!teacher_id(full_name)');
    
    if (req.user.role === 'teacher') {
      query = query.eq('teacher_id', req.user.id);
    } else if (req.user.school_id) {
      query = query.eq('classes.sections.school_id', req.user.school_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const getLessonPlanById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabaseAdmin
      .from('lesson_plans')
      .select('*, classes(name), subjects(name), profiles!teacher_id(full_name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = { createLessonPlan, submitLessonPlan, reviewLessonPlan, listLessonPlans, getLessonPlanById };
