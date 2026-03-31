const nodemailer = require('nodemailer');
require('dotenv').config();

const emailPort = Number(process.env.EMAIL_PORT || 587);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: emailPort,
  secure: emailPort === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;
