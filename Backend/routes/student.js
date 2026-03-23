const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Op, fn, col } = require('sequelize');
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const Chapter = require('../models/Chapter');
const Exam = require('../models/Exam');
const ExamResult = require('../models/ExamResult');

router.use(auth);

const toAbsoluteMediaUrl = (req, value, defaultFolder = 'chapters') => {
  if (!value || typeof value !== 'string') return '';
  if (/^(https?:|data:|blob:)/i.test(value)) return value;

  const normalized = value.replace(/\\/g, '/').trim();
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  if (normalized.startsWith('/')) {
    return `${baseUrl}${normalized}`;
  }

  if (normalized.startsWith('uploads/')) {
    return `${baseUrl}/${normalized}`;
  }

  if (normalized.startsWith(`${defaultFolder}/`)) {
    return `${baseUrl}/uploads/${normalized}`;
  }

  return `${baseUrl}/uploads/${defaultFolder}/${normalized}`;
};

const normalizeChapterMedia = (req, chapter) => {
  const plain = chapter.toObject();
  const files = Array.isArray(plain.files) ? plain.files : [];

  return {
    ...plain,
    videoUrl: toAbsoluteMediaUrl(req, plain.videoUrl, 'chapters'),
    files: files.map((file) => ({
      ...file,
      url: toAbsoluteMediaUrl(req, file?.url || file?.filename || '', 'chapters'),
    })),
  };
};

const examSubmissionDir = path.join(__dirname, '../uploads/exam-submissions');
if (!fs.existsSync(examSubmissionDir)) fs.mkdirSync(examSubmissionDir, { recursive: true });

const examSubmissionStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, examSubmissionDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const examSubmissionUpload = multer({
  storage: examSubmissionStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { isPublished: true },
      order: [['createdAt', 'DESC']],
    });

    const courseIds = courses.map((c) => c._id);
    const chapterCounts =
      courseIds.length === 0
        ? []
        : await Chapter.findAll({
            attributes: ['courseId', [fn('COUNT', col('_id')), 'count']],
            where: { courseId: { [Op.in]: courseIds } },
            group: ['courseId'],
          });

    const chapterMap = new Map(
      chapterCounts.map((row) => [String(row.courseId), Number(row.get('count')) || 0]),
    );

    const payload = courses.map((course) => ({
      ...course.toObject(),
      chapterCount: chapterMap.get(String(course._id)) || 0,
    }));

    res.json({ courses: payload });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/courses/:courseId/chapters', async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { _id: req.params.courseId, isPublished: true },
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const chapters = await Chapter.findAll({
      where: { courseId: course._id },
      order: [
        ['order', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    res.json({ course: course.toObject(), chapters: chapters.map((c) => normalizeChapterMedia(req, c)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/exams', async (req, res) => {
  try {
    const where = { isPublished: true };
    if (req.query.course) where.course = req.query.course;
    const exams = await Exam.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ exams: exams.map((e) => e.toObject()) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findOne({
      where: { _id: req.params.id, isPublished: true },
    });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ exam: exam.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/exams/submit', examSubmissionUpload.single('submissionFile'), async (req, res) => {
  try {
    const { examId, score } = req.body;
    let parsedAnswers = req.body.answers || {};

    if (typeof parsedAnswers === 'string') {
      try {
        parsedAnswers = JSON.parse(parsedAnswers);
      } catch (parseErr) {
        parsedAnswers = {};
      }
    }

    const exam = await Exam.findByPk(examId);
    if (!exam || !exam.isPublished) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const file = req.file;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const submissionFile = file
      ? {
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `${baseUrl}/uploads/exam-submissions/${file.filename}`,
        }
      : undefined;

    const result = await ExamResult.create({
      user: req.user._id,
      exam: examId,
      answers: parsedAnswers || {},
      score: Number(score) || 0,
      submissionFile,
    });

    res.status(201).json({ result: result.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
