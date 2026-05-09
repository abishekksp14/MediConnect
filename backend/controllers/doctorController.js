const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Review = require('../models/Review');
const bcrypt = require('bcryptjs');

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Public (or Protected)
exports.getDoctors = async (req, res) => {
  try {
    // Not enforcing isVerified right now per user request
    const doctors = await DoctorProfile.find().populate('user', 'name email avatar');
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching doctors', error: error.message });
  }
};

// @route   GET /api/doctors/:id
// @desc    Get single doctor by profile ID
// @access  Public (or Protected)
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id).populate('user', 'name email avatar');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching doctor', error: error.message });
  }
};

// @route   POST /api/doctors/seed
// @desc    Seed the database with dummy doctors for testing
// @access  Public
exports.seedDoctors = async (req, res) => {
  try {
    // 1. Check if we already have seeded doctors to prevent duplicates
    const existingDoctors = await User.find({ role: 'doctor' });
    if (existingDoctors.length > 0) {
      return res.status(400).json({ message: 'Database already seeded with doctors' });
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // 2. Create Dummy Users
    const users = await User.insertMany([
      { name: 'Dr. Sarah Jenkins', email: 'sarah@example.com', password, role: 'doctor' },
      { name: 'Dr. Michael Chen', email: 'michael@example.com', password, role: 'doctor' },
      { name: 'Dr. Emily Carter', email: 'emily@example.com', password, role: 'doctor' }
    ]);

    // 3. Create Corresponding DoctorProfiles
    const profiles = [
      {
        user: users[0]._id,
        specialty: 'Cardiology',
        experienceYears: 12,
        consultationFee: 150,
        bio: 'Expert in cardiovascular health.',
        isVerified: true,
        availability: [{ dayOfWeek: 1, slots: [{ startTime: '09:00', endTime: '12:00' }] }]
      },
      {
        user: users[1]._id,
        specialty: 'Dermatology',
        experienceYears: 8,
        consultationFee: 100,
        bio: 'Skin care specialist.',
        isVerified: true,
        availability: [{ dayOfWeek: 2, slots: [{ startTime: '10:00', endTime: '14:00' }] }]
      },
      {
        user: users[2]._id,
        specialty: 'Pediatrics',
        experienceYears: 15,
        consultationFee: 120,
        bio: 'Dedicated to children\'s health.',
        isVerified: true,
        availability: [{ dayOfWeek: 3, slots: [{ startTime: '13:00', endTime: '17:00' }] }]
      }
    ];

    await DoctorProfile.insertMany(profiles);

    res.json({ message: 'Successfully seeded 3 doctors! Password is password123' });
  } catch (error) {
    res.status(500).json({ message: 'Seed failed', error: error.message });
  }
};

// @route   POST /api/doctors/:id/reviews
// @desc    Add a review for a doctor
// @access  Protected
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const doctorId = req.params.id;
    const patientId = req.user.id;

    // Check if doctor exists
    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if patient already reviewed this doctor
    const alreadyReviewed = await Review.findOne({ doctor: doctorId, patient: patientId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this doctor' });
    }

    // Create review
    const review = await Review.create({
      doctor: doctorId,
      patient: patientId,
      rating: Number(rating),
      comment
    });

    // Update doctor's average rating
    const reviews = await Review.find({ doctor: doctorId });
    doctor.numReviews = reviews.length;
    doctor.averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await doctor.save();

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/doctors/availability
// @desc    Update doctor's availability
// @access  Protected (Doctor only)
exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    // Assuming auth middleware sets req.user.id
    const doctor = await DoctorProfile.findOneAndUpdate(
      { user: req.user.id },
      { availability },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json({ message: 'Availability updated successfully', availability: doctor.availability });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating availability', error: error.message });
  }
};

