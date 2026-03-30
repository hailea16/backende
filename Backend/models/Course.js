const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Course = sequelize.define(
  'Course',
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
    description: { type: DataTypes.TEXT, allowNull: true },
    instructor: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Admin' },
    thumbnail: { type: DataTypes.STRING, allowNull: true },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    isPublished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    lessons: { type: DataTypes.JSON, allowNull: false },
    createdBy: { type: DataTypes.UUID, allowNull: true },
  },
  { tableName: 'courses', timestamps: true },
);

Course.prototype.toObject = function toObject() {
  return this.get({ plain: true });
};

Course.addHook('beforeValidate', (course) => {
  if (!Array.isArray(course.lessons)) {
    course.lessons = [];
  }
});

Course.prototype.deleteOne = async function deleteOne() {
  await this.destroy();
};

module.exports = Course;
