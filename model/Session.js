const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true, expires: 0 },
  userAgent: { type: String, default: '' },
  ipAddress: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
