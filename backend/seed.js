const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB for seeding');

    // Clear existing users (optional, but good for clean seed)
    // await User.deleteMany({});

    const password = await bcrypt.hash('password123', 10);

    const testUser = {
      name: 'Test Patient',
      email: 'patient@test.com',
      password: password,
      role: 'patient'
    };

    const testDoctor = {
      name: 'Dr. Smith',
      email: 'doctor@test.com',
      password: password,
      role: 'doctor'
    };

    await User.findOneAndUpdate({ email: testUser.email }, testUser, { upsert: true, new: true });
    await User.findOneAndUpdate({ email: testDoctor.email }, testDoctor, { upsert: true, new: true });

    console.log('Seed successful:');
    console.log('Patient: patient@test.com / password123');
    console.log('Doctor: doctor@test.com / password123');
    
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
