const Course = require('../models/Course');

exports.createCourse = async (req, res) => {
  try {
    const title = req.body.title || req.body.name;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const course = await Course.create({
      title,
      description: req.body.description,
      price: req.body.price || 0,
      thumbnail: req.body.thumbnail || '',
      instructor: req.user?.userId || 'Admin',
    });

    res.status(201).json({ success: true, message: 'Course created successfully', course: course.toObject() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, count: courses.length, courses: courses.map((c) => c.toObject()) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course: course.toObject() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addLesson = async (req, res) => {
  try {
    const { title, videoUrl, duration, content } = req.body;
    const course = await Course.findByPk(req.params.courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const existing = Array.isArray(course.lessons) ? course.lessons : [];
    course.lessons = [...existing, { title, videoUrl, duration, content }];
    await course.save();

    res.json({ success: true, message: 'Lesson added', course: course.toObject() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (course) await course.deleteOne();
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

