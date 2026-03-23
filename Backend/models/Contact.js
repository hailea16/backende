const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Contact = sequelize.define(
  'Contact',
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
    name: { type: DataTypes.STRING, allowNull: true },
    username: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    source: { type: DataTypes.STRING, allowNull: true, defaultValue: 'website' },
    message: { type: DataTypes.TEXT, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: true },
    whatsapp: { type: DataTypes.STRING, allowNull: true },
    telegram: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM('pending', 'responded'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  { tableName: 'contacts', timestamps: true },
);

Contact.prototype.toObject = function toObject() {
  return this.get({ plain: true });
};

Contact.prototype.deleteOne = async function deleteOne() {
  await this.destroy();
};

module.exports = Contact;

