const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, seedDoctors, addReview, updateAvailability } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getDoctors);
router.post('/seed', seedDoctors); 
router.get('/:id', getDoctorById);
router.post('/:id/reviews', protect, addReview);
router.put('/availability', protect, updateAvailability);

module.exports = router;

