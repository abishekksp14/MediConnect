const express = require('express');
const router = express.Router();
const { addMedicalRecord, getMedicalRecords } = require('../controllers/medicalRecordController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addMedicalRecord);
router.get('/', getMedicalRecords);

module.exports = router;
