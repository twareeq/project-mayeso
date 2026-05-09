const { supabaseAdmin } = require('../../config/supabase');

/**
 * Recomputes subject aggregate and overall result for a student
 * Called after every mark insert or update
 */
async function recomputeStudentResult(studentId, classId, termId) {
  try {
    // Step 1: Get all subjects for this class
    const { data: subjects, error: subjectsError } = await supabaseAdmin
      .from('subjects')
      .select('id, name')
      .eq('class_id', classId);

    if (subjectsError) throw subjectsError;

    // Get grading scale from config
    const { data: config } = await supabaseAdmin
      .from('system_config')
      .select('value')
      .eq('key', 'grading_scale')
      .single();
    
    const gradingScale = config?.value || [
      { grade: 'A', min: 80 },
      { grade: 'B', min: 65 },
      { grade: 'C', min: 50 },
      { grade: 'D', min: 40 },
      { grade: 'F', min: 0 }
    ];

    function computeGrade(percentage) {
      const scale = [...gradingScale].sort((a, b) => b.min - a.min);
      for (const band of scale) {
        if (percentage >= band.min) return band.grade;
      }
      return 'F';
    }

    // Step 2: For each subject, sum all marks for this student in this term
    let overallAggregate = 0;
    let overallPossible = 0;

    for (const subject of subjects) {
      // Get all exams for this subject + term
      const { data: exams, error: examsError } = await supabaseAdmin
        .from('exams')
        .select('id, max_score')
        .eq('subject_id', subject.id)
        .eq('term_id', termId);

      if (examsError) throw examsError;
      if (!exams || exams.length === 0) continue;

      const examIds = exams.map(e => e.id);
      const totalPossible = exams.reduce((sum, e) => sum + Number(e.max_score), 0);

      // Get all marks for this student for these exams
      const { data: marks, error: marksError } = await supabaseAdmin
        .from('marks')
        .select('score, is_absent')
        .eq('student_id', studentId)
        .in('exam_id', examIds);

      if (marksError) throw marksError;

      const totalScore = marks ? marks.reduce((sum, m) => sum + Number(m.score), 0) : 0;

      // Compute subject grade
      const subjectPct = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
      const subjectGrade = computeGrade(subjectPct);

      // Upsert subject_aggregates
      await supabaseAdmin.from('subject_aggregates').upsert({
        student_id: studentId,
        subject_id: subject.id,
        class_id: classId,
        term_id: termId,
        total_score: totalScore,
        total_possible: totalPossible,
        grade: subjectGrade,
        last_computed_at: new Date().toISOString()
      }, { onConflict: 'student_id,subject_id,term_id' });

      overallAggregate += totalScore;
      overallPossible += totalPossible;
    }

    // Step 3: Compute overall grade
    const overallPct = overallPossible > 0 ? (overallAggregate / overallPossible) * 100 : 0;
    const overallGrade = computeGrade(overallPct);

    // Step 4: Upsert student_results
    await supabaseAdmin.from('student_results').upsert({
      student_id: studentId,
      class_id: classId,
      term_id: termId,
      overall_aggregate: overallAggregate,
      total_possible: overallPossible,
      overall_grade: overallGrade,
      last_computed_at: new Date().toISOString()
    }, { onConflict: 'student_id,class_id,term_id' });

    // Step 5: Recompute class positions for ALL students in this class+term
    await recomputeClassPositions(classId, termId);

  } catch (error) {
    console.error(`Aggregation error for student ${studentId}:`, error);
    throw error;
  }
}

async function recomputeClassPositions(classId, termId) {
  const { data: results, error } = await supabaseAdmin
    .from('student_results')
    .select('id, student_id, overall_aggregate')
    .eq('class_id', classId)
    .eq('term_id', termId)
    .order('overall_aggregate', { ascending: false });

  if (error) throw error;
  if (!results) return;

  // Assign positions with tie handling
  let position = 1;
  for (let i = 0; i < results.length; i++) {
    if (i > 0 && Number(results[i].overall_aggregate) < Number(results[i-1].overall_aggregate)) {
      position = i + 1;
    }
    await supabaseAdmin
      .from('student_results')
      .update({ class_position: position })
      .eq('id', results[i].id);
  }
}

module.exports = { recomputeStudentResult, recomputeClassPositions };
