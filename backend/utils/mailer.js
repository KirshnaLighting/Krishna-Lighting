const nodemailer = require('nodemailer');

// Set up the transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // smtp.gmail.com
  port: process.env.EMAIL_PORT, // 587 (TLS)
  secure: process.env.EMAIL_PORT == 465, // Only true for SSL (port 465)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to take messages');
  }
});

module.exports = transporter;
