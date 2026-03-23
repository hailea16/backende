const router = require('express').Router();
const { Op } = require('sequelize');
const User = require('../models/User');
const { adminAuth } = require('../middleware/adminAuth');

router.use(adminAuth);

// GET all users
router.get('/users', async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = { isAdmin: { [Op.ne]: true } };
    if (status === 'approved') where.isApproved = true;
    if (status === 'pending') {
      where.isApproved = false;
      where.emailVerified = true;
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// APPROVE user
router.post('/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.emailVerified) {
      return res.status(400).json({ message: 'Cannot approve an account until email is verified' });
    }
    user.isApproved = true;
    user.approvedBy = req.user._id;
    await user.save();
    res.json({ success: true, message: 'User approved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isAdmin) return res.status(403).json({ message: 'Cannot delete admin' });
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DASHBOARD stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const total = await User.count({ where: { isAdmin: { [Op.ne]: true } } });
    const approved = await User.count({ where: { isApproved: true, isAdmin: { [Op.ne]: true } } });
    const pending = await User.count({ where: { isApproved: false, isAdmin: { [Op.ne]: true } } });
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = await User.count({
      where: { createdAt: { [Op.gte]: weekAgo }, isAdmin: { [Op.ne]: true } },
    });
    res.json({ totalUsers: total, approvedUsers: approved, pendingUsers: pending, recentRegistrations: recent });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
