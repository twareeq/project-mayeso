const PDFDocument = require('pdfkit');

const generateStudentReport = (data, stream) => {
  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(stream);

  // Header
  doc.fontSize(20).text('Project Mayeso - Student Progress Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`School: ${data.school_name}`);
  doc.text(`Student: ${data.student_name} (${data.student_number})`);
  doc.text(`Class: ${data.class_name}`);
  doc.moveDown();

  // Table Header
  const tableTop = 200;
  doc.font('Helvetica-Bold');
  doc.text('Subject', 50, tableTop);
  doc.text('Score', 200, tableTop);
  doc.text('Grade', 300, tableTop);
  doc.text('Remarks', 400, tableTop);

  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  // Table Content
  let y = tableTop + 25;
  doc.font('Helvetica');
  data.marks.forEach(m => {
    doc.text(m.subject, 50, y);
    doc.text(m.score.toString(), 200, y);
    doc.text(m.grade, 300, y);
    doc.text(m.remarks || '-', 400, y);
    y += 20;
  });

  doc.end();
};

module.exports = { generateStudentReport };
