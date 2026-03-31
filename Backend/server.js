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

dotenv.config();
const connectDB = require('./config/db');
const app = express();

const allowedOrigins = Array.from(
  new Set(
    [

      'https://www.nssse.edu.et',
      process.env.FRONTEND_URL,
      ...(process.env.FRONTEND_URLS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ].filter(Boolean),
  ),
);

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     credentials: true,
//     optionsSuccessStatus: 200,
//   }),
// );

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/', (req, res) => res.json({ message: 'Welcome to the NSSSE API' }));
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin/exams', require('./routes/admin/exams'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin/courses', require('./routes/admin/courses'));
app.use('/api/student', require('./routes/student'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    process.exit(1);
  }
};

startServer();
