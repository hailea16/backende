const router = require('express').Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
  try {
    const { username, message, password, whatsapp, telegram } = req.body;
    if (!username || !message || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await Contact.create({
      username,
      message,
      password,
      whatsapp,
      telegram,
    });

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

