const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

exports.submitContact = async (req, res) => {
  try {
    const { name, username, email, phone, message, source } = req.body;

    // Create contact record
    const contact = await Contact.create({
      name,
      username,
      email,
      phone,
      message,
      source: source || 'website'
    });

    // Send email notification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"NDS Contact" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: 'New Contact Form Submission',
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Source:</strong> ${source || 'website'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      contactId: contact._id
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting contact form'
    });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({ order: [['createdAt', 'DESC']] });
    
    res.json({
      success: true,
      count: contacts.length,
      contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
