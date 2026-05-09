const { supabaseAdmin } = require('./src/config/supabase');

async function simulateCreate() {
  const mockUser = { id: '16496702-16cd-465c-beb7-d87d6d49c528' }; // Genius John
  const mockBody = {
    class_id: '529eba34-933e-4ac3-b7a0-320bcc282eef', // Standard 8
    subject_id: '1ea79889-ee57-4ff0-b18b-5a8d44ace587', // Mathematics
    title: 'Test Lesson Plan',
    content: 'This is a test content that should be long enough.',
    week_number: 1,
    academic_year: '2025/2026'
  };

  try {
    console.log('Inserting with:', mockBody);
    const { data, error } = await supabaseAdmin
      .from('lesson_plans')
      .insert({
        teacher_id: mockUser.id,
        ...mockBody,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error('Insert Error:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (err) {
    console.error('Fatal Error:', err);
  }
}

simulateCreate();
