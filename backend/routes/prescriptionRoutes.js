const express = require('express');
const router = express.Router();
const { createPrescription, getPatientPrescriptions, getDoctorPrescriptions, downloadPrescription } = require('../controllers/prescriptionController');

router.post('/', createPrescription);
router.get('/patient/:patientId', getPatientPrescriptions);
router.get('/doctor/:doctorId', getDoctorPrescriptions);
router.get('/:id/download', downloadPrescription);


module.exports = router;
