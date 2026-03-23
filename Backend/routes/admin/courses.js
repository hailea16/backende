const express = require('express');
const router = express.Router();
const Course = require('../../models/Course');
const Chapter = require('../../models/Chapter');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { adminAuth } = require('../../middleware/adminAuth');

router.use(adminAuth);

const uploadDir = path.join(__dirname, '../../uploads/chapters');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(mp4|mov|webm|pdf|doc|docx|txt|ppt|pptx|jpg|jpeg|png|gif)$/i;
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.test(ext)) return cb(new Error('Invalid file type'));
    cb(null, true);
  },
});

router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll({ order: [['createdAt', 'DESC']] });
    res.json(courses.map((c) => c.toObject()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const title = (req.body.title || req.body.name || '').trim();
    const description = (req.body.description || req.body.desc || '').trim();

    if (!title) return res.status(400).json({ message: 'Course title required' });

    const course = await Course.create({
      title,
      description,
      isPublished: req.body.isPublished !== undefined ? !!req.body.isPublished : true,
      createdBy: req.user.id,
    });

    res.status(201).json(course.toObject());
  } catch (err) {
    console.error('Create course error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, isPublished } = req.body;
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (title) course.title = `${title}`.trim();
    if (description !== undefined) course.description = `${description}`.trim();
    if (isPublished !== undefined) course.isPublished = !!isPublished;

    await course.save();
    res.json(course.toObject());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const chapters = await Chapter.findAll({ where: { courseId: course._id } });
    for (const chapter of chapters) {
      const files = Array.isArray(chapter.files) ? chapter.files : [];
      if (files.length) {
        await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(uploadDir, file.filename);
            if (fs.existsSync(filePath)) {
              try {
                await fs.promises.unlink(filePath);
              } catch (err) {
                console.error('Failed to delete file:', file.filename, err);
              }
            }
          }),
        );
      }
      await chapter.deleteOne();
    }

    await course.deleteOne();
    res.json({ message: 'Course and its chapters deleted successfully' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

router.get('/:courseId/chapters', async (req, res) => {
  try {
    const chapters = await Chapter.findAll({
      where: { courseId: req.params.courseId },
      order: [['order', 'ASC']],
    });
    res.json(chapters.map((c) => c.toObject()));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:courseId/chapters', async (req, res) => {
  try {
    const title = (req.body.title || req.body.name || '').trim();
    const textContent = (req.body.textContent || req.body.content || req.body.text || '').trim();
    const videoUrl = (req.body.videoUrl || req.body.video || '').trim();

    if (!title) return res.status(400).json({ message: 'Chapter title required' });

    const course = await Course.findByPk(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const lastChapter = await Chapter.findOne({
      where: { courseId: req.params.courseId },
      order: [['order', 'DESC']],
    });
    const order = lastChapter ? Number(lastChapter.order || 0) + 1 : 0;

    const chapter = await Chapter.create({
      courseId: req.params.courseId,
      title,
      textContent,
      videoUrl,
      order,
      createdBy: req.user.id,
      files: [],
    });

    res.status(201).json(chapter.toObject());
  } catch (err) {
    console.error('Create chapter error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.put('/chapters/:id', async (req, res) => {
  try {
    const { title, textContent, content, videoUrl } = req.body;
    const chapter = await Chapter.findByPk(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    if (title) chapter.title = `${title}`.trim();
    if (textContent !== undefined) chapter.textContent = `${textContent}`.trim();
    else if (content !== undefined) chapter.textContent = `${content}`.trim();
    if (videoUrl !== undefined) chapter.videoUrl = `${videoUrl}`.trim();

    await chapter.save();
    res.json(chapter.toObject());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/chapters/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findByPk(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const files = Array.isArray(chapter.files) ? chapter.files : [];
    if (files.length) {
      await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(uploadDir, file.filename);
          if (fs.existsSync(filePath)) {
            try {
              await fs.promises.unlink(filePath);
            } catch (err) {
              console.error('Failed to delete file:', file.filename, err);
            }
          }
        }),
      );
    }

    await chapter.deleteOne();
    res.json({ message: 'Chapter deleted successfully' });
  } catch (err) {
    console.error('Delete chapter error:', err);
    res.status(500).json({ message: 'Failed to delete chapter' });
  }
});

router.post('/chapters/:chapterId/files', upload.array('files', 10), async (req, res) => {
  try {
    const chapter = await Chapter.findByPk(req.params.chapterId);
    if (!chapter) {
      req.files.forEach((f) => fs.unlink(f.path, () => {}));
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const files = req.files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `${baseUrl}/uploads/chapters/${file.filename}`,
    }));

    const existing = Array.isArray(chapter.files) ? chapter.files : [];
    chapter.files = [...existing, ...files];
    await chapter.save();

    res.json({ files });
  } catch (err) {
    if (req.files) req.files.forEach((f) => fs.unlink(f.path, () => {}));
    console.error('Upload files error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/chapters/:chapterId/files/:filename', async (req, res) => {
  try {
    const chapter = await Chapter.findByPk(req.params.chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    let decodedFilename = req.params.filename;
    try {
      decodedFilename = decodeURIComponent(req.params.filename);
    } catch (e) {
      decodedFilename = req.params.filename;
    }

    const existing = Array.isArray(chapter.files) ? chapter.files : [];
    const targetFile = existing.find((file) => file.filename === decodedFilename);
    if (!targetFile) return res.status(404).json({ message: 'File not found in chapter' });

    chapter.files = existing.filter((file) => file.filename !== decodedFilename);
    await chapter.save();

    const filePath = path.join(uploadDir, decodedFilename);
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error('Failed to delete uploaded file from disk:', decodedFilename, err);
      }
    }

    res.json({ message: 'File removed successfully', chapter: chapter.toObject() });
  } catch (err) {
    console.error('Delete chapter file error:', err);
    res.status(500).json({ message: 'Failed to delete chapter file' });
  }
});

module.exports = router;

