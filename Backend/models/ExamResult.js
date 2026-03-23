const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ExamResult = sequelize.define(
  'ExamResult',
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
    user: { type: DataTypes.UUID, allowNull: true },
    exam: { type: DataTypes.UUID, allowNull: true },
    answers: { type: DataTypes.JSONB, allowNull: true },
    score: { type: DataTypes.FLOAT, allowNull: true },
    submissionFile: { type: DataTypes.JSONB, allowNull: true },
  },
  { tableName: 'exam_results', timestamps: true },
);

ExamResult.prototype.toObject = function toObject() {
  return this.get({ plain: true });
};

ExamResult.prototype.deleteOne = async function deleteOne() {
  await this.destroy();
};

module.exports = ExamResult;

