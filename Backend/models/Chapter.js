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
    textContent: { type: DataTypes.TEXT, allowNull: false },
    videoUrl: { type: DataTypes.STRING, allowNull: false, defaultValue: '' },
    files: { type: DataTypes.JSON, allowNull: false },
    isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
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

Chapter.addHook('beforeValidate', (chapter) => {
  if (chapter.textContent == null) {
    chapter.textContent = '';
  }
  if (!Array.isArray(chapter.files)) {
    chapter.files = [];
  }
});

Chapter.prototype.deleteOne = async function deleteOne() {
  await this.destroy();
};

module.exports = Chapter;
