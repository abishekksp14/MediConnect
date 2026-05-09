const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');

// @route   POST /api/appointments/book
// @desc    Book a new appointment
// @access  Protected (Assuming we add auth middleware later, using req.body.patientId for now)
exports.bookAppointment = async (req, res) => {
  try {
    const { patientId, doctorProfileId, date, timeSlot } = req.body;

    // Find the doctor user ID from the profile
    const profile = await DoctorProfile.findById(doctorProfileId);
    if (!profile) return res.status(404).json({ message: 'Doctor profile not found' });

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId, // Would normally come from req.user.id with auth middleware
      doctor: profile.user,
      date,
      timeSlot,
      fee: profile.consultationFee,
      status: 'pending'
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error booking appointment', error: error.message });
  }
};

// @route   GET /api/appointments/patient/:patientId
// @desc    Get all appointments for a patient
// @access  Protected
exports.getPatientAppointments = async (req, res) => {
  try {
    // Populate doctor user details to show doctor name on dashboard
    const appointments = await Appointment.find({ patient: req.params.patientId })
      .populate('doctor', 'name email avatar')
      .sort({ date: 1 });
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// @route   GET /api/appointments/doctor/:doctorId
// @desc    Get all appointments for a doctor
// @access  Protected
exports.getDoctorAppointments = async (req, res) => {
  try {
    // Populate patient user details
    const appointments = await Appointment.find({ doctor: req.params.doctorId })
      .populate('patient', 'name email avatar')
      .sort({ date: 1 });
      
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

// @route   PUT /api/appointments/:id/status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('patient', 'name email').populate('doctor', 'name email');
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Emit cancellation notification to the patient
    if (status === 'cancelled' && req.io) {
      req.io.to(`user_${appointment.patient._id}`).emit('appointment_cancelled', {
        message: `Your appointment with Dr. ${appointment.doctor.name} has been cancelled.`,
      });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

// @route   GET /api/appointments/:id
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email avatar')
      .populate('doctor', 'name email avatar');
    
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment', error: error.message });
  }
};
