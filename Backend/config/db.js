const sequelize = require('./sequelize');

const buildConnectionDebug = () => ({
  dialect: sequelize.getDialect(),
  host: sequelize.config.host || null,
  port: sequelize.config.port || null,
  database: sequelize.config.database || null,
  username: sequelize.config.username || null,
  hasPassword: Boolean(sequelize.config.password),
});

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

    const queryInterface = sequelize.getQueryInterface();
    const chapterTable = await queryInterface.describeTable('chapters');
    if (!chapterTable.isPublished) {
      await queryInterface.addColumn('chapters', 'isPublished', {
        type: require('sequelize').DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }

    const exams = await Exam.findAll();
    let migratedExamCount = 0;
    for (const exam of exams) {
      const currentQuestions = Array.isArray(exam.questions) ? exam.questions : [];
      const normalizedQuestions = Exam.normalizeExamQuestions(currentQuestions);

      if (JSON.stringify(currentQuestions) !== JSON.stringify(normalizedQuestions)) {
        exam.questions = normalizedQuestions;
        await exam.save();
        migratedExamCount += 1;
      }
    }

    if (migratedExamCount > 0) {
      console.log(`Migrated ${migratedExamCount} exam(s) to normalized question format`);
    }

    console.log(`${sequelize.getDialect()} connected successfully`);

    return {
      sequelize,
      models: { User, Course, Chapter, Exam, ExamResult, Contact, Video },
    };
  } catch (error) {
    console.error('Database connection error');
    console.error('Connection config:', buildConnectionDebug());
    console.error('Details:', {
      message: error.message || null,
      name: error.name || null,
      code: error.code || error.original?.code || null,
      errno: error.errno || error.original?.errno || null,
      syscall: error.syscall || error.original?.syscall || null,
      address: error.address || error.original?.address || null,
      port: error.port || error.original?.port || null,
      sqlState: error.original?.sqlState || null,
      sqlMessage: error.original?.sqlMessage || null,
    });
    throw error;
  }
};

module.exports = connectDB;
