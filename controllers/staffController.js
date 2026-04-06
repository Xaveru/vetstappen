const Clinic = require('../model/Clinic');
const Reservation = require('../model/Reservation');
const { TIME_SLOTS, SERVICES } = require('../utils/constants');
const { toISODate } = require('../utils/dates');
const { normalizeText, isAllowedValue, isReservableDate } = require('../utils/validation');
const { isValidSlotForClinic } = require('../utils/appointments');

function ownerLabel(reservation) {
  return reservation.isAnonymous ? `${reservation.ownerName} (Anonymous booking)` : reservation.ownerName;
}

async function renderStaff(req, res, next) {
  try {
    const clinics = await Clinic.find().sort({ name: 1 }).lean();
    let reservations = [];
    let stats = null;

    if (req.currentUser?.isStaff) {
      const staffReservations = await Reservation.find()
        .populate('clinicId')
        .sort({ date: 1, time: 1, createdAt: 1 })
        .lean();

      reservations = staffReservations.map((reservation) => ({
        ...reservation,
        ownerLabel: ownerLabel(reservation),
        allowNoShow: reservation.status === 'Booked',
        allowCancel: reservation.status === 'Booked'
      }));

      stats = {
        total: reservations.length,
        booked: reservations.filter((reservation) => reservation.status === 'Booked').length,
        cancelled: reservations.filter((reservation) => reservation.status === 'Cancelled').length,
        noShow: reservations.filter((reservation) => reservation.status === 'No-show').length
      };
    }

    return res.render('staff', {
      title: 'VetStappen | Staff Dashboard',
      clinics,
      reservations,
      stats,
      timeSlots: TIME_SLOTS,
      services: SERVICES,
      today: toISODate(new Date())
    });
  } catch (error) {
    return next(error);
  }
}

async function addWalkIn(req, res, next) {
  try {
    const ownerName = normalizeText(req.body.ownerName);
    const clinicId = normalizeText(req.body.clinicId);
    const date = normalizeText(req.body.date);
    const time = normalizeText(req.body.time);
    const service = normalizeText(req.body.service);

    if (!ownerName || !clinicId || !date || !time || !service) {
      return res.redirect(`/staff?error=${encodeURIComponent('Please complete all walk-in fields.')}`);
    }

    if (!isReservableDate(date) || !isAllowedValue(time, TIME_SLOTS) || !isAllowedValue(service, SERVICES)) {
      return res.redirect(`/staff?error=${encodeURIComponent('Please choose a valid clinic slot within the next 7 days.')}`);
    }

    const clinic = await Clinic.findById(clinicId).lean();
    if (!clinic || !isValidSlotForClinic(clinic, { date, time, service })) {
      return res.redirect(`/staff?error=${encodeURIComponent('The selected clinic slot is invalid.')}`);
    }

    const conflict = await Reservation.findOne({ clinicId, date, time, service, status: { $ne: 'Cancelled' } }).lean();
    if (conflict) {
      return res.redirect(`/staff?error=${encodeURIComponent('That slot is already booked. Please choose another time.')}`);
    }

    await Reservation.create({
      userId: null,
      ownerName,
      ownerEmail: '',
      isAnonymous: false,
      clinicId,
      date,
      time,
      service,
      status: 'Booked',
      isWalkIn: true
    });

    return res.redirect(`/staff?success=${encodeURIComponent('Walk-in appointment added successfully!')}`);
  } catch (error) {
    return next(error);
  }
}

async function markNoShow(req, res, next) {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.redirect(`/staff?error=${encodeURIComponent('Reservation not found.')}`);
    }

    if (reservation.status !== 'Booked') {
      return res.redirect(`/staff?error=${encodeURIComponent('Only booked reservations can be marked as no-show.')}`);
    }

    reservation.status = 'No-show';
    await reservation.save();

    return res.redirect(`/staff?success=${encodeURIComponent('Reservation marked as no-show.')}`);
  } catch (error) {
    return next(error);
  }
}

async function cancelReservationAsStaff(req, res, next) {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.redirect(`/staff?error=${encodeURIComponent('Reservation not found.')}`);
    }

    if (reservation.status !== 'Booked') {
      return res.redirect(`/staff?error=${encodeURIComponent('Only booked reservations can be cancelled.')}`);
    }

    reservation.status = 'Cancelled';
    await reservation.save();

    return res.redirect(`/staff?success=${encodeURIComponent('Reservation cancelled successfully.')}`);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  renderStaff,
  addWalkIn,
  markNoShow,
  cancelReservationAsStaff
};
