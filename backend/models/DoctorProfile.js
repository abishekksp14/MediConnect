const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  specialty: {
    type: String,
    required: true,
  },
  qualifications: [{
    type: String,
  }],
  experienceYears: {
    type: Number,
    required: true,
  },
  consultationFee: {
    type: Number,
    required: true,
  },
  bio: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false, // Admin needs to approve
  },
  averageRating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  availability: [{
    dayOfWeek: {
      type: Number, // 0 = Sunday, 1 = Monday, etc.
      required: true,
      min: 0,
      max: 6,
    },
    slots: [{
      startTime: String, // e.g., "09:00"
      endTime: String,   // e.g., "17:00"
    }]
  }]
}, { timestamps: true });

const DoctorProfile = mongoose.model('DoctorProfile', doctorProfileSchema);
module.exports = DoctorProfile;
