const Clinic = require('../model/Clinic');
const Reservation = require('../model/Reservation');
const { TIME_SLOTS, SERVICES } = require('../utils/constants');
const { toISODate } = require('../utils/dates');
const { slotKey, generateSlots, isValidSlotForClinic } = require('../utils/appointments');
const { generateReferenceCode } = require('../utils/security');
const { normalizeEmail, normalizeText, isValidEmail } = require('../utils/validation');

async function generateUniqueReferenceCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = generateReferenceCode();
    const exists = await Reservation.exists({ referenceCode: candidate });
    if (!exists) {
      return candidate;
    }
  }

  throw new Error('Unable to generate a unique reservation reference code.');
}

function buildAppointmentsRedirect(filters = {}, messageType = '', message = '') {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  if (messageType && message) {
    query.set(messageType, message);
  }

  const queryString = query.toString();
  return `/appointments${queryString ? `?${queryString}` : ''}`;
}

async function renderAppointments(req, res, next) {
  try {
    const clinics = await Clinic.find().sort({ name: 1 }).lean();
    const selectedClinicId = String(req.query.clinic || clinics[0]?._id || '');
    const selectedClinic = clinics.find((clinic) => String(clinic._id) === selectedClinicId) || clinics[0] || null;

    const filters = {
      clinic: selectedClinic ? String(selectedClinic._id) : '',
      date: String(req.query.date || toISODate(new Date())),
      time: String(req.query.time || ''),
      service: String(req.query.service || '')
    };

    let slots = [];
    let reservations = [];

    if (selectedClinic) {
      slots = generateSlots(selectedClinic);
      reservations = await Reservation.find({
        clinicId: selectedClinic._id,
        status: { $ne: 'Cancelled' }
      }).lean();
    }

    const bookedSlots = new Set(reservations.map((reservation) => slotKey(reservation)));
    const filteredSlots = slots
      .filter((slot) => (!filters.date || slot.date === filters.date)
        && (!filters.time || slot.time === filters.time)
        && (!filters.service || slot.service === filters.service))
      .map((slot) => ({ ...slot, isBooked: bookedSlots.has(slotKey(slot)) }));

    return res.render('appointments', {
      title: 'VetStappen | Appointments',
      clinics,
      selectedClinic,
      filters,
      timeSlots: TIME_SLOTS,
      services: SERVICES,
      slots: filteredSlots,
      canBookWithAccount: Boolean(req.currentUser),
      accountName: req.currentUser?.name || '',
      accountEmail: req.currentUser?.email || ''
    });
  } catch (error) {
    return next(error);
  }
}

async function bookAppointment(req, res, next) {
  try {
    const slotId = String(req.body.slotId || '');
    const [clinicId, date, time, service] = slotId.split('|');
    const bookingMode = String(req.body.bookingMode || (req.currentUser ? 'account' : 'anonymous')).trim();
    const filters = { clinic: clinicId, date, time, service };

    if (!clinicId || !date || !time || !service) {
      return res.redirect(buildAppointmentsRedirect({}, 'error', 'Please choose a valid appointment slot.'));
    }

    const clinic = await Clinic.findById(clinicId).lean();
    if (!clinic || !isValidSlotForClinic(clinic, { date, time, service })) {
      return res.redirect(buildAppointmentsRedirect(filters, 'error', 'The selected slot is no longer valid.'));
    }

    const existingReservation = await Reservation.findOne({
      clinicId,
      date,
      time,
      service,
      status: { $ne: 'Cancelled' }
    }).lean();

    if (existingReservation) {
      return res.redirect(buildAppointmentsRedirect(filters, 'error', 'Sorry, that slot is already booked.'));
    }

    if (bookingMode === 'account') {
      if (!req.currentUser) {
        return res.redirect(`/login?error=${encodeURIComponent('Please login to create an account-linked reservation, or choose anonymous booking.')}`);
      }

      await Reservation.create({
        userId: req.currentUser._id,
        ownerName: req.currentUser.name,
        ownerEmail: req.currentUser.email,
        isAnonymous: false,
        clinicId,
        date,
        time,
        service,
        status: 'Booked',
        isWalkIn: false
      });

      return res.redirect(`/reservations?success=${encodeURIComponent('Appointment booked successfully!')}`);
    }

    const ownerName = normalizeText(req.body.ownerName);
    const ownerEmail = normalizeEmail(req.body.ownerEmail);

    if (!ownerName) {
      return res.redirect(buildAppointmentsRedirect(filters, 'error', 'Anonymous bookings require the owner name.'));
    }

    if (!isValidEmail(ownerEmail)) {
      return res.redirect(buildAppointmentsRedirect(filters, 'error', 'Please provide a valid email for your anonymous booking.'));
    }

    const referenceCode = await generateUniqueReferenceCode();
    await Reservation.create({
      userId: null,
      ownerName,
      ownerEmail,
      isAnonymous: true,
      referenceCode,
      clinicId,
      date,
      time,
      service,
      status: 'Booked',
      isWalkIn: false
    });

    const params = new URLSearchParams({
      lookupEmail: ownerEmail,
      lookupReference: referenceCode,
      success: `Anonymous booking saved. Keep your reference code: ${referenceCode}`
    });

    return res.redirect(`/reservations?${params.toString()}`);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  TIME_SLOTS,
  SERVICES,
  renderAppointments,
  bookAppointment
};
