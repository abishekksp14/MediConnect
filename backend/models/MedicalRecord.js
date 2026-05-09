const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['Report', 'Prescription', 'Lab Result', 'Other'],
    default: 'Other',
  },
  fileUrl: {
    type: String, // URL to Cloudinary or local storage
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Doctor who added it (if applicable)
  }
}, { timestamps: true });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
module.exports = MedicalRecord;
