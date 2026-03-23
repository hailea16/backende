const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

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
    description: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    course: { type: DataTypes.STRING, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    questions: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    totalPoints: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    createdBy: { type: DataTypes.UUID, allowNull: false },
  },
  { tableName: 'exams', timestamps: true },
);

Exam.addHook('beforeSave', async (exam) => {
  const questions = Array.isArray(exam.questions) ? exam.questions : [];
  exam.totalPoints = questions.reduce((sum, q) => {
    const pts = Number(q?.points);
    return sum + (Number.isFinite(pts) && pts > 0 ? pts : 1);
  }, 0);
});

Exam.prototype.toObject = function toObject() {
  return this.get({ plain: true });
};

Exam.prototype.deleteOne = async function deleteOne() {
  await this.destroy();
};

module.exports = Exam;

