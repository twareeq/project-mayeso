const { supabase } = require('../../config/supabase');

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_FAILED', message: error.message }
      });
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return res.status(401).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'User profile not found' }
      });
    }

    res.json({
      success: true,
      data: {
        session: data.session,
        user: profile
      }
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};

module.exports = { login, getMe };
