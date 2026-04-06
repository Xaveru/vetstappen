const mongoose = require('mongoose');
const { hashPassword, isPasswordHash } = require('../utils/security');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  bio: { type: String, default: 'No bio yet.', trim: true },
  avatarPath: { type: String, default: '/uploads/default-avatar.png' },
  isStaff: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', function preSave(next) {
  if (!this.isModified('password')) {
    return next();
  }

  if (isPasswordHash(this.password)) {
    return next();
  }

  this.password = hashPassword(this.password);
  return next();
});

module.exports = mongoose.model('User', userSchema);
