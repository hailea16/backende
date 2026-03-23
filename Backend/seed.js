require('dotenv').config();
const { Op } = require('sequelize');
const connectDB = require('./config/db');
const sequelize = require('./config/sequelize');

const User = require('./models/User');
const Course = require('./models/Course');

const admins = [
  {
    name: 'Administrator',
    email: 'admin@nds.com',
    username: 'admin1',
    password: 'admin123',
    phoneNumber: '+251944770488',
    age: 30,
    grade: 'Admin',
    sex: 'Male',
    isAdmin: true,
    isApproved: true,
    emailVerified: true,
  },
  {
    name: 'Administrator Two',
    email: 'haileadisu16@gmail.com',
    username: 'admin2',
    password: 'admin@12',
    phoneNumber: '+251902412923',
    age: 28,
    grade: 'Admin',
    sex: 'Male',
    isAdmin: true,
    isApproved: true,
    emailVerified: true,
  },
];

const courses = [
  {
    title: 'Web Development Bootcamp',
    description: 'Learn HTML, CSS, JavaScript, React and Node.js',
    instructor: 'NDS Academy',
    price: 0,
    isPublished: true,
    lessons: [
      { title: 'Introduction to Web', content: 'Basics of the internet', duration: '10 min' },
      { title: 'HTML Fundamentals', content: 'Learn HTML structure', duration: '20 min' },
      { title: 'CSS Basics', content: 'Styling your pages', duration: '20 min' },
    ],
  },
  {
    title: 'Trading Masterclass',
    description: 'Forex and Crypto Trading Strategy',
    instructor: 'NDS Trading',
    price: 0,
    isPublished: true,
    lessons: [
      { title: 'Trading Basics', content: 'Introduction to trading', duration: '15 min' },
      { title: 'Forex Trading', content: 'Learn Forex strategies', duration: '30 min' },
    ],
  },
];

const seedAdmins = async () => {
  for (const adminData of admins) {
    const existing = await User.findOne({
      where: { [Op.or]: [{ username: adminData.username }, { email: adminData.email }] },
    });

    if (existing) {
      console.log(`⚠️ Admin exists → ${adminData.username}, updating...`);
      await existing.update({ ...adminData });
      console.log(`✅ Admin updated → ${adminData.username}`);
    } else {
      await User.create({ ...adminData });
      console.log(`✅ Admin created → ${adminData.username}`);
    }
  }
};

const seedCourses = async () => {
  for (const courseData of courses) {
    const exists = await Course.findOne({ where: { title: courseData.title } });
    if (exists) {
      console.log(`⚠️ Course exists → ${courseData.title}`);
      continue;
    }
    await Course.create(courseData);
    console.log(`✅ Course created → ${courseData.title}`);
  }
};

const runSeed = async () => {
  await connectDB();
  console.log('\n🌱 Seeding Admins...');
  await seedAdmins();
  console.log('\n📚 Seeding Courses...');
  await seedCourses();
  console.log('\n🎉 DATABASE SEED COMPLETED SUCCESSFULLY');
};

runSeed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });

