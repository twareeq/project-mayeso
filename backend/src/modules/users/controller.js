const { supabaseAdmin } = require('../../config/supabase');

const listUsers = async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' });

    if (req.user.role !== 'admin' && req.user.school_id) {
      query = query.eq('school_id', req.user.school_id);
    }

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

const createUser = async (req, res, next) => {
  const { email, password, full_name, role, school_id, zone_id, district_id } = req.body;

  try {
    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        return res.status(400).json({
          success: false,
          error: { message: 'A user with this email already exists.' }
        });
      }
      throw authError;
    }

    // Profile creation
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        full_name,
        email,
        role,
        school_id: school_id || null,
        zone_id: zone_id || null,
        district_id: district_id || null
      })
      .select()
      .single();

    if (profileError) throw profileError;

    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listUsers, createUser };
