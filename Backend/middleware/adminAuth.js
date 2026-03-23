const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isUuid = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 IMPORTANT: depends on how you signed token
    const userId = decoded.id || decoded.user?.id;

    if (!isUuid(userId)) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findByPk(userId);

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.user = user;

    if (typeof next === 'function') return next();
    return res.status(500).json({ message: 'Middleware chain error: next is not a function' });
  } catch (err) {
    console.error('Admin Auth Error:', err.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { adminAuth };
