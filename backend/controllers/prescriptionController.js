const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const { generatePrescriptionPDF } = require('../utils/PrescriptionGenerator');
const fs = require('fs');

// ... (existing code)

// @route GET /api/prescriptions/:id/download
exports.downloadPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name')
      .populate('doctor', 'name');
    
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });

    // Dummy data for specialties since it's in DoctorProfile, not User
    const pdfPath = await generatePrescriptionPDF({
      appointmentId: prescription.appointment,
      doctorName: prescription.doctor.name,
      doctorSpecialty: 'General Practice', 
      patientName: prescription.patient.name,
      diagnosis: prescription.diagnosis,
      medications: prescription.medicines,
      advice: prescription.advice
    });

    res.download(pdfPath, (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Delete temp file after download
      fs.unlinkSync(pdfPath);
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
};


// @route POST /api/prescriptions
exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, patientId, doctorId, diagnosis, medicines, advice, followUpDate } = req.body;

    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: patientId,
      doctor: doctorId,
      diagnosis,
      medicines,
      advice,
      followUpDate,
    });

    // Populate for response
    const populated = await prescription.populate([
      { path: 'patient', select: 'name email' },
      { path: 'doctor', select: 'name email' },
    ]);

    // Optionally emit real-time notification to patient
    if (req.io) {
      req.io.to(`user_${patientId}`).emit('new_prescription', {
        message: `Dr. ${populated.doctor.name} has issued you a new prescription.`,
        prescription: populated,
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error creating prescription', error: error.message });
  }
};

// @route GET /api/prescriptions/patient/:patientId
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.params.patientId })
      .populate('doctor', 'name email')
      .populate('appointment', 'date timeSlot')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
};

// @route GET /api/prescriptions/doctor/:doctorId
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctor: req.params.doctorId })
      .populate('patient', 'name email')
      .populate('appointment', 'date timeSlot')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
  }
};
