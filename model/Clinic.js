const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema);
