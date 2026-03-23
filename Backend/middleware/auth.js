const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isUuid = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!isUuid(decoded.id)) return res.status(401).json({ message: 'Invalid token' });

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) throw new Error();
    req.user = user;
    if (typeof next === 'function') return next();
    return res.status(500).json({ message: 'Middleware chain error: next is not a function' });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
