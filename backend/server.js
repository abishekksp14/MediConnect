const dns = require('dns');
// Set DNS servers for MongoDB SRV resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { server } = require('./app');
const mongoose = require('mongoose');

// Database Connection
const maskedUri = process.env.MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@');
console.log(`Connecting to MongoDB at: ${maskedUri}`);
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
