require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const DoctorProfile = require('./models/DoctorProfile');

const doctorsData = [
  { name: 'Dr. Sarah Smith', email: 'sarah.smith@mediconnect.com', specialty: 'Cardiology', fee: 150, experience: 12 },
  { name: 'Dr. James Wilson', email: 'james.wilson@mediconnect.com', specialty: 'Dermatology', fee: 120, experience: 8 },
  { name: 'Dr. Emily Brown', email: 'emily.brown@mediconnect.com', specialty: 'Pediatrics', fee: 100, experience: 15 },
  { name: 'Dr. Michael Chen', email: 'michael.chen@mediconnect.com', specialty: 'Neurology', fee: 200, experience: 20 },
  { name: 'Dr. Lisa Gupta', email: 'lisa.gupta@mediconnect.com', specialty: 'General Practice', fee: 80, experience: 5 },
  { name: 'Dr. Robert Taylor', email: 'robert.taylor@mediconnect.com', specialty: 'Orthopedics', fee: 180, experience: 14 },
  { name: 'Dr. Maria Garcia', email: 'maria.garcia@mediconnect.com', specialty: 'Gynecology', fee: 130, experience: 10 },
  { name: 'Dr. David Miller', email: 'david.miller@mediconnect.com', specialty: 'Psychiatry', fee: 160, experience: 11 },
  { name: 'Dr. Jennifer Lee', email: 'jennifer.lee@mediconnect.com', specialty: 'Ophthalmology', fee: 140, experience: 9 },
  { name: 'Dr. Thomas Anderson', email: 'thomas.anderson@mediconnect.com', specialty: 'Urology', fee: 170, experience: 13 },
  { name: 'Dr. Susan White', email: 'susan.white@mediconnect.com', specialty: 'Endocrinology', fee: 145, experience: 16 },
  { name: 'Dr. Kevin Jones', email: 'kevin.jones@mediconnect.com', specialty: 'Gastroenterology', fee: 155, experience: 12 },
  { name: 'Dr. Karen Davis', email: 'karen.davis@mediconnect.com', specialty: 'Oncology', fee: 250, experience: 18 },
  { name: 'Dr. Paul Wilson', email: 'paul.wilson@mediconnect.com', specialty: 'Radiology', fee: 110, experience: 7 },
  { name: 'Dr. Linda Martin', email: 'linda.martin@mediconnect.com', specialty: 'Rheumatology', fee: 135, experience: 9 }
];

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    const salt = await bcrypt.genSalt(10);
    const commonPassword = await bcrypt.hash('doctor123', salt);

    for (const doc of doctorsData) {
      // Check if user exists
      let user = await User.findOne({ email: doc.email });
      if (!user) {
        user = await User.create({
          name: doc.name,
          email: doc.email,
          password: commonPassword,
          role: 'doctor',
          avatar: `https://i.pravatar.cc/150?u=${doc.email}`
        });
        console.log(`Created user: ${doc.name}`);
      }

      // Check if profile exists
      let profile = await DoctorProfile.findOne({ user: user._id });
      if (!profile) {
        await DoctorProfile.create({
          user: user._id,
          specialty: doc.specialty,
          experienceYears: doc.experience,
          consultationFee: doc.fee,
          bio: `Experienced specialist in ${doc.specialty} with over ${doc.experience} years in practice. Committed to providing high-quality patient care.`,
          isVerified: true,
          qualifications: ['MBBS', 'MD', `Specialization in ${doc.specialty}`],
          availability: [
            { dayOfWeek: 1, slots: [{ startTime: '09:00', endTime: '17:00' }] },
            { dayOfWeek: 2, slots: [{ startTime: '09:00', endTime: '17:00' }] },
            { dayOfWeek: 3, slots: [{ startTime: '09:00', endTime: '17:00' }] },
            { dayOfWeek: 4, slots: [{ startTime: '09:00', endTime: '17:00' }] },
            { dayOfWeek: 5, slots: [{ startTime: '09:00', endTime: '17:00' }] }
          ]
        });
        console.log(`Created profile for: ${doc.name}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDoctors();
