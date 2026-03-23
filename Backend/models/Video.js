const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Video = sequelize.define(
  'Video',
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
    videoUrl: { type: DataTypes.STRING, allowNull: false },
    duration: { type: DataTypes.STRING, allowNull: true },
    order: { type: DataTypes.INTEGER, allowNull: true },
    course: { type: DataTypes.UUID, allowNull: true },
  },
  { tableName: 'videos', timestamps: true },
);

Video.prototype.toObject = function toObject() {
  return this.get({ plain: true });
};

Video.prototype.deleteOne = async function deleteOne() {
  await this.destroy();
};

module.exports = Video;

