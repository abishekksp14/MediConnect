const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a prescription PDF
 * @param {Object} prescriptionData - Data for the prescription
 * @returns {Promise<string>} - Path to the generated PDF
 */
const generatePrescriptionPDF = (prescriptionData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const filename = `prescription_${prescriptionData.appointmentId}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '..', 'temp', filename);

      // Ensure temp directory exists
      if (!fs.existsSync(path.join(__dirname, '..', 'temp'))) {
        fs.mkdirSync(path.join(__dirname, '..', 'temp'));
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('MediConnect Prescription', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.moveDown();

      // Doctor Info
      doc.fontSize(14).text('Doctor Information', { underline: true });
      doc.fontSize(12).text(`Name: Dr. ${prescriptionData.doctorName}`);
      doc.text(`Specialty: ${prescriptionData.doctorSpecialty}`);
      doc.moveDown();

      // Patient Info
      doc.fontSize(14).text('Patient Information', { underline: true });
      doc.fontSize(12).text(`Name: ${prescriptionData.patientName}`);
      doc.moveDown();

      // Diagnosis
      doc.fontSize(14).text('Diagnosis', { underline: true });
      doc.fontSize(12).text(prescriptionData.diagnosis);
      doc.moveDown();

      // Medications
      doc.fontSize(14).text('Medications', { underline: true });
      prescriptionData.medications.forEach((med, index) => {
        doc.fontSize(12).text(`${index + 1}. ${med.name} - ${med.dosage} (${med.frequency})`);
        doc.fontSize(10).text(`   Note: ${med.note || 'None'}`);
      });
      doc.moveDown();

      // Advice
      doc.fontSize(14).text('Advice/Notes', { underline: true });
      doc.fontSize(12).text(prescriptionData.advice);

      // Footer
      doc.fontSize(10).text('This is a digitally generated prescription.', { align: 'center', bottom: 50 });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generatePrescriptionPDF };
