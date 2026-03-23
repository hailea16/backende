const util = require('node:util');
try {
  Object.defineProperty(util, '_extend', {
    value: Object.assign,
    configurable: true,
    writable: true,
  });
} catch (err) {}

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

const allowedOrigins = [
  'http://localhost:4000',
  'https://api.nssse.edu.et',
  process.env.FRONTEND_URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB().catch((err) => console.error('❌ Database error:', err));

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/exams', require('./routes/admin/exams'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin/courses', require('./routes/admin/courses'));
app.use('/api/student', require('./routes/student'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
