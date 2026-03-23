const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/User');
const transporter = require('../config/transporter');

// ---------- Helper: send verification email ----------
const sendVerificationEmail = async (to, code) => {
  const mailOptions = {
    from: `"NDS Education" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your email - NDS Education',
    html: `
      <div style="font-family: Arial; padding:20px">
        <h2>Email Verification</h2>
        <p>Your verification code:</p>
        <h1>${code}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// =====================================================
// REGISTER INIT
// =====================================================
router.post('/register-init', async (req, res) => {
  try {
    let { name, sex, age, grade, phoneNumber, email, username, password } = req.body;

    // 🔧 Capitalize sex to match enum ['Male','Female','Other']
    if (sex) sex = sex.charAt(0).toUpperCase() + sex.slice(1).toLowerCase();

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
    if (existing) return res.status(400).json({ message: 'Email or username already registered' });

    const verificationCode = crypto.randomInt(100000, 999999).toString();

    const user = new User({
      name,
      sex,
      age,
      grade,
      phoneNumber,
      email,
      username,
      password,
      emailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
      isApproved: false,
      isAdmin: false,
      loginAttempts: 0,
    });

    await user.save();
    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message: 'Verification code sent to email',
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =====================================================
// VERIFY EMAIL
// =====================================================
router.post('/verify-email', async (req, res) => {
  try {
    const { userId, code } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' });

    if (user.emailVerificationCode !== code || user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.emailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({ message: 'Email verified successfully. Await admin approval.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =====================================================
// RESEND VERIFICATION CODE
// =====================================================
router.post('/resend-code', async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' });

    const newCode = crypto.randomInt(100000, 999999).toString();
    user.emailVerificationCode = newCode;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, newCode);

    res.json({ message: 'New verification code sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =====================================================
// LOGIN
// =====================================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: { [Op.or]: [{ email: username }, { username }] },
    });
    if (!user) return res.status(401).json({ message: 'Invalid username or email' });

    if (user.isLocked) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(423).json({ message: `Account locked. Try again in ${remaining} minutes.` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await user.resetLoginAttempts();

    if (!user.emailVerified) return res.status(403).json({ message: 'Email not verified' });
    if (!user.isApproved) return res.status(403).json({ message: 'Account pending admin approval' });

    const token = jwt.sign(
      { id: user._id, role: user.isAdmin ? 'admin' : 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =====================================================
// CHECK APPROVAL STATUS
// =====================================================
router.get('/check-approval/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;

    const user = await User.findOne({
      where: { [Op.or]: [{ email: identifier }, { username: identifier }] },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let status = 'pending';
    let message = 'Your account is awaiting admin approval.';

    if (!user.emailVerified) {
      status = 'unverified';
      message = 'Email not verified.';
    } else if (user.isApproved) {
      status = 'approved';
      message = 'Your account is approved.';
    }

    res.json({ status, message, userId: user._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =====================================================
// QUICK APPROVE (DEV ONLY)
// =====================================================
router.post('/quick-approve/:userId', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Not available in production' });
  }

  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.emailVerified) {
      return res.status(400).json({ message: 'Cannot approve an account until email is verified' });
    }

    user.isApproved = true;
    await user.save();

    res.json({ message: 'User approved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// =====================================================
// STATS
// =====================================================
router.get('/stats', async (req, res) => {
  try {
    const total = await User.count();
    const approved = await User.count({ where: { isApproved: true } });
    const pending = await User.count({ where: { isApproved: false, emailVerified: true } });

    res.json({
      totalUsers: total,
      approvedUsers: approved,
      pendingUsers: pending,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
