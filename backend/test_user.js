const { supabaseAdmin } = require('./src/config/supabase');

async function run() {
  try {
    const email = 'test_headteacher@mayeso.com';
    const password = 'password123';
    
    // Create district
    let { data: district } = await supabaseAdmin.from('districts').select('*').limit(1).single();
    if (!district) {
        const res = await supabaseAdmin.from('districts').insert({name: 'Test District'}).select().single();
        district = res.data;
    }
    
    // Create zone
    let { data: zone } = await supabaseAdmin.from('zones').select('*').limit(1).single();
    if (!zone) {
        const res = await supabaseAdmin.from('zones').insert({name: 'Test Zone', district_id: district.id}).select().single();
        zone = res.data;
    }
    
    // Create school
    let { data: school } = await supabaseAdmin.from('schools').select('*').eq('code', 'TST').single();
    if (!school) {
      const res = await supabaseAdmin.from('schools').insert({ name: 'Test School', code: 'TST', zone_id: zone.id }).select().single();
      school = res.data;
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    
    if (authError) {
        console.log("Auth Error:", authError);
    }

    if (authUser && authUser.user) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.user.id,
          full_name: 'Test Head Teacher',
          email,
          role: 'head_teacher',
          school_id: school.id,
          is_active: true
        });
        
      if (profileError) {
          console.log("Profile Error:", profileError);
      }
    }
    
    console.log("Test user created successfully!");
  } catch(e) {
    console.error(e);
  }
}
run();
