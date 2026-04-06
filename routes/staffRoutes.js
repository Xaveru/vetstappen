const express = require('express');
const { renderStaff, addWalkIn, markNoShow, cancelReservationAsStaff } = require('../controllers/staffController');
const { requireStaff } = require('../middleware/auth');

const router = express.Router();

router.get('/staff', renderStaff);
router.post('/staff/walkin', requireStaff, addWalkIn);
router.post('/staff/reservations/:id/noshow', requireStaff, markNoShow);
router.post('/staff/reservations/:id/cancel', requireStaff, cancelReservationAsStaff);

module.exports = router;
