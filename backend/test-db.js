const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = process.env.MONGODB_URI;

console.log('Testing connection to:', uri.replace(/\/\/.*@/, '//<credentials>@'));

mongoose.connect(uri, { family: 4 })
  .then(() => {
    console.log('SUCCESS: MongoDB connected successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILURE: MongoDB connection error:', err);
    process.exit(1);
  });
