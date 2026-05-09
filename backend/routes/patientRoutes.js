const express = require('express');
const router = express.Router();
const { getPatientProfile, createOrUpdateProfile } = require('../controllers/patientController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/profile', getPatientProfile);
router.post('/profile', createOrUpdateProfile);
router.put('/profile', createOrUpdateProfile);

module.exports = router;
