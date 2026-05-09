const PDFDocument = require('pdfkit');

/**
 * Generates a high-fidelity Student Result Sheet PDF
 * @param {Object} data - Contains student, results, aggregates, exams, and marks
 * @param {Stream} stream - Node.js writeable stream
 */
function generateStudentResultPDF(data, stream) {
  const { student, result, aggregates, exams, marks } = data;
  const doc = new PDFDocument({ size: 'A4', margin: 40 });

  doc.pipe(stream);

  // --- HEADER ---
  doc.font('Helvetica-Bold').fontSize(14).text('REPUBLIC OF MALAWI', { align: 'center' });
  doc.fontSize(12).text('MINISTRY OF EDUCATION', { align: 'center' });
  doc.moveDown(0.2);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.5);

  doc.fontSize(16).text(student.schools.name.toUpperCase(), { align: 'center' });
  doc.fontSize(14).text('ACADEMIC RESULT SHEET', { align: 'center' });
  doc.moveDown();

  // --- IDENTITY SECTION ---
  const leftCol = 40;
  const rightCol = 300;
  let currentY = doc.y;

  doc.font('Helvetica').fontSize(10);
  doc.text(`Student Name:  ${student.full_name}`, leftCol, currentY);
  doc.text(`Student No: ${student.student_number}`, rightCol, currentY);
  
  doc.moveDown(0.5);
  currentY = doc.y;
  doc.text(`Class:         ${student.classes.name}`, leftCol, currentY);
  doc.text(`Section:    ${student.section_name || 'N/A'}`, rightCol, currentY);

  doc.moveDown(0.5);
  currentY = doc.y;
  doc.text(`School:        ${student.schools.name}`, leftCol, currentY);
  doc.text(`Term:       ${result.term_name || 'N/A'}`, rightCol, currentY);

  doc.moveDown();
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown();

  doc.font('Helvetica-Bold').fontSize(11).text('SUBJECT PERFORMANCE');
  doc.moveDown(0.5);

  // --- TABLE SECTION ---
  const tableTop = doc.y;
  const colWidths = {
    subject: 100,
    ca: 30,
    midterm: 45,
    endterm: 50,
    total: 35,
    max: 35,
    pct: 40,
    grade: 35
  };

  // Draw table header
  doc.font('Helvetica-Bold').fontSize(9);
  let x = 40;
  doc.text('Subject', x, tableTop); x += colWidths.subject;
  doc.text('CA1', x, tableTop); x += colWidths.ca;
  doc.text('CA2', x, tableTop); x += colWidths.ca;
  doc.text('CA3', x, tableTop); x += colWidths.ca;
  doc.text('CA4', x, tableTop); x += colWidths.ca;
  doc.text('Midterm', x, tableTop); x += colWidths.midterm;
  doc.text('End-Term', x, tableTop); x += colWidths.endterm;
  doc.text('Total', x, tableTop); x += colWidths.total;
  doc.text('Max', x, tableTop); x += colWidths.max;
  doc.text('%', x, tableTop); x += colWidths.pct;
  doc.text('Grade', x, tableTop);

  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.2);

  // Draw rows
  doc.font('Helvetica').fontSize(9);
  
  aggregates.forEach(agg => {
    let rowX = 40;
    const rowY = doc.y;

    // Get marks for this subject
    const subjectExams = exams.filter(e => e.subject_id === agg.subject_id);
    const getMark = (type, seq) => {
      const exam = subjectExams.find(e => e.exam_type === type && (seq === undefined || e.sequence_no === seq));
      if (!exam) return '—';
      const mark = marks.find(m => m.exam_id === exam.id);
      return mark ? mark.score : '—';
    };

    doc.text(agg.subjects.name, rowX, rowY, { width: colWidths.subject }); rowX += colWidths.subject;
    doc.text(getMark('continuous_assessment', 1).toString(), rowX, rowY); rowX += colWidths.ca;
    doc.text(getMark('continuous_assessment', 2).toString(), rowX, rowY); rowX += colWidths.ca;
    doc.text(getMark('continuous_assessment', 3).toString(), rowX, rowY); rowX += colWidths.ca;
    doc.text(getMark('continuous_assessment', 4).toString(), rowX, rowY); rowX += colWidths.ca;
    doc.text(getMark('midterm').toString(), rowX, rowY); rowX += colWidths.midterm;
    doc.text(getMark('endterm').toString(), rowX, rowY); rowX += colWidths.endterm;
    doc.text(agg.total_score.toString(), rowX, rowY); rowX += colWidths.total;
    doc.text(agg.total_possible.toString(), rowX, rowY); rowX += colWidths.max;
    doc.text(`${Number(agg.percentage).toFixed(1)}%`, rowX, rowY); rowX += colWidths.pct;
    doc.text(agg.grade || '—', rowX, rowY);

    doc.moveDown(1.2);
  });

  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.2);

  // Total row
  doc.font('Helvetica-Bold');
  doc.text('TOTAL', 40, doc.y);
  doc.text(result.overall_aggregate.toString(), 40 + colWidths.subject + 4*colWidths.ca + colWidths.midterm + colWidths.endterm, doc.y);
  doc.text(result.total_possible.toString(), 40 + colWidths.subject + 4*colWidths.ca + colWidths.midterm + colWidths.endterm + colWidths.total, doc.y);
  doc.text(`${Number(result.overall_percentage).toFixed(1)}%`, 40 + colWidths.subject + 4*colWidths.ca + colWidths.midterm + colWidths.endterm + colWidths.total + colWidths.max, doc.y);
  doc.text(result.overall_grade || '—', 40 + colWidths.subject + 4*colWidths.ca + colWidths.midterm + colWidths.endterm + colWidths.total + colWidths.max + colWidths.pct, doc.y);

  doc.moveDown(2);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown();

  // --- SUMMARY ---
  doc.font('Helvetica-Bold').fontSize(11).text('SUMMARY');
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(10);
  doc.text(`Overall Aggregate:    ${result.overall_aggregate} / ${result.total_possible}`);
  doc.text(`Overall Percentage:   ${Number(result.overall_percentage).toFixed(1)}%`);
  doc.text(`Overall Grade:        ${result.overall_grade} — ${getGradeLabel(result.overall_grade)}`);
  doc.text(`Class Position:       ${getOrdinal(result.class_position)} out of ${result.student_count || 'N/A'} students`);
  doc.text(`Attendance Rate:      ${result.attendance_rate || '—'}%`);

  doc.moveDown();
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown();

  // --- GRADING SCALE ---
  doc.font('Helvetica-Bold').fontSize(11).text('GRADING SCALE');
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(9);
  doc.text('A (80–100%): Distinction   B (65–79%): Merit');
  doc.text('C (50–64%): Credit         D (40–49%): Pass    F (0–39%): Fail');

  doc.moveDown();
  doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown();

  // --- REMARKS ---
  doc.font('Helvetica-Bold').fontSize(11).text("Teacher's Remarks:");
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(10).text(result.teacher_remarks || '_______________________________________________________________', { oblique: true });

  doc.moveDown(2);
  currentY = doc.y;
  doc.text('Class Teacher: _____________________', 40, currentY);
  doc.text('Date: _________________', 300, currentY);

  doc.moveDown(2);
  currentY = doc.y;
  doc.text('Head Teacher: ______________________', 40, currentY);
  doc.text('School Stamp: [          ]', 300, currentY);

  // --- FOOTER ---
  doc.fontSize(8).text(`This result sheet was generated by the Mayeso School Performance Monitoring System on ${new Date().toLocaleDateString()}`, 40, doc.page.height - 50, { align: 'center', color: 'grey' });

  doc.end();
}

function getGradeLabel(grade) {
  const labels = { 'A': 'Distinction', 'B': 'Merit', 'C': 'Credit', 'D': 'Pass', 'F': 'Fail' };
  return labels[grade] || '';
}

function getOrdinal(n) {
  if (!n) return '—';
  const s = ["th", "st", "nd", "rd"],
        v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

module.exports = { generateStudentResultPDF };
