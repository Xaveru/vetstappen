const express = require('express');
const { renderAppointments, bookAppointment } = require('../controllers/appointmentController');

const router = express.Router();

router.get('/appointments', renderAppointments);
router.post('/appointments/book', bookAppointment);

module.exports = router;
