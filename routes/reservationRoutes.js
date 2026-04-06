const express = require('express');
const {
  renderReservations,
  editReservation,
  cancelReservation,
  editAnonymousReservation,
  cancelAnonymousReservation
} = require('../controllers/reservationController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/reservations', renderReservations);
router.post('/reservations/:id/edit', requireAuth, editReservation);
router.post('/reservations/:id/cancel', requireAuth, cancelReservation);
router.post('/guest-reservations/:id/edit', editAnonymousReservation);
router.post('/guest-reservations/:id/cancel', cancelAnonymousReservation);

module.exports = router;
