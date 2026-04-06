const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  ownerName: { type: String, required: true, trim: true },
  ownerEmail: { type: String, trim: true, lowercase: true, default: '' },
  isAnonymous: { type: Boolean, default: false },
  referenceCode: { type: String, trim: true, uppercase: true, sparse: true, index: true },
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  service: { type: String, required: true },
  status: { type: String, enum: ['Booked', 'Cancelled', 'No-show'], default: 'Booked' },
  isWalkIn: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
