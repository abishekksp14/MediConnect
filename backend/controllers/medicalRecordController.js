const MedicalRecord = require('../models/MedicalRecord');

// @route POST /api/medical-records
exports.addMedicalRecord = async (req, res) => {
  try {
    const { title, description, date, type, fileUrl } = req.body;
    const medicalRecord = await MedicalRecord.create({
      patient: req.user.id,
      title,
      description,
      date,
      type,
      fileUrl
    });
    res.status(201).json(medicalRecord);
  } catch (error) {
    res.status(500).json({ message: 'Error adding medical record', error: error.message });
  }
};

// @route GET /api/medical-records
exports.getMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical records', error: error.message });
  }
};
