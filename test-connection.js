// // test-connection.js
// require('dotenv').config();
// const mongoose = require('mongoose');

// console.log('Testing MongoDB connection...');
// console.log('Using URI:', process.env.MONGODB_URI ? 'URI loaded from .env' : 'URI not found!');

// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log('✅ MongoDB connected successfully!');
//     console.log('Database name:', mongoose.connection.db.databaseName);
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error('❌ MongoDB connection failed:', error.message);
//     process.exit(1);
//   });