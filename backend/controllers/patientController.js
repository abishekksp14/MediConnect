const PatientProfile = require('../models/PatientProfile');

exports.getPatientProfile = async (req, res) => {
  try {
    const profile = await PatientProfile.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!profile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createOrUpdateProfile = async (req, res) => {
  try {
    const { age, gender, bloodGroup, allergies, chronicConditions, medications, emergencyContact } = req.body;
    
    let profile = await PatientProfile.findOne({ user: req.user.id });
    
    if (profile) {
      // Update existing
      profile.age = age || profile.age;
      profile.gender = gender || profile.gender;
      profile.bloodGroup = bloodGroup || profile.bloodGroup;
      profile.allergies = allergies || profile.allergies;
      profile.chronicConditions = chronicConditions || profile.chronicConditions;
      profile.medications = medications || profile.medications;
      profile.emergencyContact = emergencyContact || profile.emergencyContact;
      
      await profile.save();
      return res.json(profile);
    }
    
    // Create new
    profile = await PatientProfile.create({
      user: req.user.id,
      age,
      gender,
      bloodGroup,
      allergies,
      chronicConditions,
      medications,
      emergencyContact
    });
    
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
