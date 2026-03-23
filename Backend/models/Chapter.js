const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Chapter = sequelize.define(
  'Chapter',
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
    courseId: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    textContent: { type: DataTypes.TEXT, allowNull: false, defaultValue: '' },
    videoUrl: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    files: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdBy: { type: DataTypes.UUID, allowNull: false },
  },
  {
    tableName: 'chapters',
    timestamps: true,
    indexes: [{ fields: ['courseId'] }],
  },
);

Chapter.prototype.toObject = function toObject() {
  return this.get({ plain: true });
};

Chapter.prototype.deleteOne = async function deleteOne() {
  await this.destroy();
};

module.exports = Chapter;

