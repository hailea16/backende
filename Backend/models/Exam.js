const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const parseJsonArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const normalizeExamQuestion = (question) => {
  const options = Array.isArray(question?.options)
    ? question.options
    : Array.isArray(question?.choices)
      ? question.choices
      : [];

  let correctAnswer = question?.correctAnswer;
  if (typeof correctAnswer !== 'number') {
    const parsedCorrectAnswer = Number(correctAnswer);
    correctAnswer = Number.isInteger(parsedCorrectAnswer) ? parsedCorrectAnswer : 0;
  }

  return {
    ...question,
    questionText: question?.questionText || question?.question || question?.text || '',
    options,
    correctAnswer,
    points: Number(question?.points) > 0 ? Number(question.points) : 1,
  };
};

const normalizeExamQuestions = (questions) =>
  parseJsonArray(questions).map(normalizeExamQuestion);

const Exam = sequelize.define(
  'Exam',
  {
    _id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('_id');
      },
    },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    course: { type: DataTypes.STRING, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    questions: { type: DataTypes.JSON, allowNull: false },
    totalPoints: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdBy: { type: DataTypes.UUID, allowNull: false },
  },
  { tableName: 'exams', timestamps: true },
);

Exam.addHook('beforeSave', async (exam) => {
  if (exam.description == null) {
    exam.description = '';
  }
  const questions = normalizeExamQuestions(exam.questions);
  exam.questions = questions;
  exam.totalPoints = questions.reduce((sum, q) => {
    const pts = Number(q?.points);
    return sum + (Number.isFinite(pts) && pts > 0 ? pts : 1);
  }, 0);
});

Exam.prototype.toObject = function toObject() {
  const plain = this.get({ plain: true });
  const questions = normalizeExamQuestions(plain.questions);

  return {
    ...plain,
    questions,
    totalPoints: questions.reduce((sum, q) => {
      const pts = Number(q?.points);
      return sum + (Number.isFinite(pts) && pts > 0 ? pts : 1);
    }, 0),
  };
};

Exam.prototype.deleteOne = async function deleteOne() {
  await this.destroy();
};

Exam.normalizeExamQuestion = normalizeExamQuestion;
Exam.normalizeExamQuestions = normalizeExamQuestions;

module.exports = Exam;
