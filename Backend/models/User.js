const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/sequelize');

const looksLikeBcryptHash = (value) =>
  typeof value === 'string' && /^\$2[aby]\$\d{2}\$/.test(value) && value.length >= 55;

const User = sequelize.define(
  'User',
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
    name: { type: DataTypes.STRING, allowNull: false },
    sex: {
      type: DataTypes.ENUM('Male', 'Female', 'Other'),
      allowNull: false,
      set(value) {
        const v = value ? `${value}` : value;
        if (!v) return this.setDataValue('sex', v);
        this.setDataValue(
          'sex',
          v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(),
        );
      },
    },
    age: { type: DataTypes.INTEGER, allowNull: true },
    grade: { type: DataTypes.STRING, allowNull: true },
    phoneNumber: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    emailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    emailVerificationCode: { type: DataTypes.STRING, allowNull: true },
    emailVerificationExpires: { type: DataTypes.DATE, allowNull: true },
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
    approvedBy: { type: DataTypes.UUID, allowNull: true },
    lastLogin: { type: DataTypes.DATE, allowNull: true },
    loginAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    lockUntil: { type: DataTypes.DATE, allowNull: true },
    enrolledCourses: { type: DataTypes.JSONB, defaultValue: [] },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isLocked: {
      type: DataTypes.VIRTUAL,
      get() {
        const lockUntil = this.getDataValue('lockUntil');
        return !!(lockUntil && lockUntil.getTime() > Date.now());
      },
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    indexes: [{ unique: true, fields: ['email'] }, { unique: true, fields: ['username'] }],
  },
);

User.addHook('beforeSave', async (user) => {
  if (!user.changed('password')) return;
  if (looksLikeBcryptHash(user.password)) return;
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

User.prototype.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.incLoginAttempts = async function incLoginAttempts() {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 30 * 60 * 1000;

  const lockUntil = this.lockUntil ? this.lockUntil.getTime() : null;
  if (lockUntil && lockUntil > Date.now()) return this;

  if (lockUntil && lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = null;
    await this.save();
    return this;
  }

  this.loginAttempts = Number(this.loginAttempts || 0) + 1;
  if (this.loginAttempts >= MAX_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME);
  }

  await this.save();
  return this;
};

User.prototype.resetLoginAttempts = async function resetLoginAttempts() {
  this.loginAttempts = 0;
  this.lockUntil = null;
  await this.save();
  return this;
};

User.prototype.toObject = function toObject() {
  return this.get({ plain: true });
};

User.prototype.deleteOne = async function deleteOne() {
  await this.destroy();
};

module.exports = User;

