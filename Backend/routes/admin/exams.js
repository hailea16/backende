const router = require('express').Router();
const Exam = require('../../models/Exam');
const User = require('../../models/User');
const { adminAuth } = require('../../middleware/adminAuth');

router.use(adminAuth);

const parseBoolean = (value, fallback) => {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return Boolean(value);
};

const withCreatedBy = (exam) => {
  const plain = exam.toObject();
  const createdBy = exam.createdByUser ? exam.createdByUser.toObject() : undefined;
  delete plain.createdByUser;
  return { ...plain, createdBy };
};

router.get('/', async (req, res) => {
  try {
    const { course, published } = req.query;
    const where = {};
    if (course) where.course = course;
    if (published !== undefined) where.isPublished = published === 'true';

    const exams = await Exam.findAll({
      where,
      include: [{ model: User, as: 'createdByUser', attributes: ['_id', 'name', 'username'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json(exams.map(withCreatedBy));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [{ model: User, as: 'createdByUser', attributes: ['_id', 'name', 'username'] }],
    });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(withCreatedBy(exam));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, course, duration, questions, isPublished } = req.body;
    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question required' });
    }

    const exam = await Exam.create({
      title,
      description,
      course,
      duration,
      questions,
      isPublished: parseBoolean(isPublished, false),
      createdBy: req.user._id,
    });

    res.status(201).json(exam.toObject());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const { title, description, course, duration, questions, isPublished } = req.body;
    if (title !== undefined) exam.title = title;
    if (description !== undefined) exam.description = description;
    if (course !== undefined) exam.course = course;
    if (duration !== undefined) exam.duration = duration;
    if (questions !== undefined) exam.questions = questions;
    if (isPublished !== undefined) exam.isPublished = parseBoolean(isPublished, exam.isPublished);

    await exam.save();
    res.json(exam.toObject());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    await exam.deleteOne();
    res.json({ message: 'Exam deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
