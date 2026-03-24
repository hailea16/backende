const sequelize = require('./sequelize');

const connectDB = async () => {
  try {
    const User = require('../models/User');
    const Course = require('../models/Course');
    const Chapter = require('../models/Chapter');
    const Exam = require('../models/Exam');
    const ExamResult = require('../models/ExamResult');
    const Contact = require('../models/Contact');
    const Video = require('../models/Video');

    if (!Exam.associations?.createdByUser) {
      Exam.belongsTo(User, { foreignKey: 'createdBy', as: 'createdByUser' });
    }
    if (!Chapter.associations?.course) {
      Chapter.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
    }
    if (!Chapter.associations?.creator) {
      Chapter.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
    }
    if (!ExamResult.associations?.userInfo) {
      ExamResult.belongsTo(User, { foreignKey: 'user', as: 'userInfo' });
    }
    if (!ExamResult.associations?.examInfo) {
      ExamResult.belongsTo(Exam, { foreignKey: 'exam', as: 'examInfo' });
    }
    if (!Video.associations?.courseInfo) {
      Video.belongsTo(Course, { foreignKey: 'course', as: 'courseInfo' });
    }

    await sequelize.authenticate();
    await sequelize.sync();
    console.log('PostgreSQL connected successfully');

    return {
      sequelize,
      models: { User, Course, Chapter, Exam, ExamResult, Contact, Video },
    };
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
