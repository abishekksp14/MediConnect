const express = require('express');
const router = express.Router();
const { bookAppointment, getPatientAppointments, getDoctorAppointments, updateAppointmentStatus, getAppointmentById } = require('../controllers/appointmentController');

router.post('/book', bookAppointment);
router.get('/patient/:patientId', getPatientAppointments);
router.get('/doctor/:doctorId', getDoctorAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id/status', updateAppointmentStatus);

module.exports = router;
