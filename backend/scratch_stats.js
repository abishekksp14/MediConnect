require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const doctors = await User.countDocuments({role: 'doctor'});
  const patients = await User.countDocuments({role: 'patient'});
  const totalAppointments = await Appointment.countDocuments();
  const completed = await Appointment.countDocuments({status: 'completed'});
  const pending = await Appointment.countDocuments({status: 'pending'});
  const cancelled = await Appointment.countDocuments({status: 'cancelled'});
  
  const startOfDay = new Date();
  startOfDay.setHours(0,0,0,0);
  const todayCount = await Appointment.countDocuments({ createdAt: { $gte: startOfDay } });
  
  const prescriptions = await Prescription.countDocuments();
  
  console.log("--- PROJECT STATS FOR EXCEL ---");
  console.log(`Total Doctors: ${doctors}`);
  console.log(`Total Patients: ${patients}`);
  console.log(`Total Appointments: ${totalAppointments}`);
  console.log(`Completed: ${completed}`);
  console.log(`Pending: ${pending}`);
  console.log(`Cancelled: ${cancelled}`);
  console.log(`Booked Today: ${todayCount}`);
  console.log(`Total Prescriptions Issued: ${prescriptions}`);
  console.log("-------------------------------");
  
  process.exit();
}).catch(e => {
  console.error(e);
  process.exit(1);
});
