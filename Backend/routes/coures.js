const router = require('express').Router();
const path = require('path');
const fs = require('fs');

// In production, you would serve videos from a CDN or cloud storage.
// For development, we'll serve local files from /uploads.

router.get('/videos/:course/:filename', (req, res) => {
  const { course, filename } = req.params;
  const videoPath = path.join(__dirname, '../uploads', course, filename);
  
  // Check if file exists
  if (fs.existsSync(videoPath)) {
    res.sendFile(videoPath);
  } else {
    res.status(404).json({ message: 'Video not found' });
  }
});

// You can also return a list of videos for each course
router.get('/:course', (req, res) => {
  const course = req.params.course;
  const courseDir = path.join(__dirname, '../uploads', course);
  
  if (!fs.existsSync(courseDir)) {
    return res.json({ videos: [] });
  }

  const files = fs.readdirSync(courseDir).filter(file => 
    file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.ogg')
  );

  const videos = files.map(file => ({
    title: file.replace(/\.[^/.]+$/, ''), // remove extension
    url: `/api/courses/videos/${course}/${file}`
  }));

  res.json({ course, videos });
});

module.exports = router;