const Clinic = require('../model/Clinic');
const Reservation = require('../model/Reservation');
const { TIME_SLOTS, SERVICES } = require('../utils/constants');
const { normalizeEmail, normalizeText, isAllowedValue, isReservableDate, isValidEmail } = require('../utils/validation');
const { isValidSlotForClinic } = require('../utils/appointments');

function canManageAccountReservation(currentUser, reservation) {
  if (!currentUser) return false;
  if (currentUser.isStaff) return true;
  if (!reservation.userId) return false;
  return String(reservation.userId._id || reservation.userId) === String(currentUser._id);
}

function buildReservationsUrl({ messageType = '', message = '', lookupEmail = '', lookupReference = '' } = {}) {
  const params = new URLSearchParams();
  if (lookupEmail) params.set('lookupEmail', lookupEmail);
  if (lookupReference) params.set('lookupReference', lookupReference);
  if (messageType && message) params.set(messageType, message);
  const queryString = params.toString();
  return `/reservations${queryString ? `?${queryString}` : ''}`;
}

function formatOwnerLabel(reservation, viewer) {
  if (viewer === 'staff') {
    return reservation.isAnonymous ? `${reservation.ownerName} (Anonymous booking)` : reservation.ownerName;
  }

  if (viewer === 'guest') {
    return reservation.ownerName;
  }

  return reservation.isAnonymous ? 'Anonymous' : reservation.ownerName;
}

function mapReservationForView(reservation, options = {}) {
  const viewer = options.viewer || 'user';
  const managementMode = options.managementMode || 'account';
  const canManage = Boolean(options.canManage);
  const basePath = managementMode === 'guest' ? '/guest-reservations' : '/reservations';
  const editable = canManage && reservation.status === 'Booked';

  return {
    ...reservation,
    ownerLabel: formatOwnerLabel(reservation, viewer),
    canManage,
    editable,
    showNoShow: Boolean(options.showNoShow),
    editPath: `${basePath}/${reservation._id}/edit`,
    cancelPath: `${basePath}/${reservation._id}/cancel`,
    lookupEmail: options.lookupEmail || '',
    lookupReference: options.lookupReference || '',
    statusClass: String(reservation.status || '').toLowerCase().replace(/[^a-z]+/g, '-')
  };
}

async function renderReservations(req, res, next) {
  try {
    const lookupEmail = normalizeEmail(req.query.lookupEmail);
    const lookupReference = normalizeText(req.query.lookupReference).toUpperCase();
    const anonymousLookup = {
      email: lookupEmail,
      referenceCode: lookupReference,
      attempted: Boolean(lookupEmail || lookupReference),
      reservations: [],
      resultCount: 0
    };

    if (lookupEmail && lookupReference) {
      const anonymousReservations = await Reservation.find({
        isAnonymous: true,
        ownerEmail: lookupEmail,
        referenceCode: lookupReference
      })
        .populate('clinicId')
        .sort({ date: 1, time: 1, createdAt: 1 })
        .lean();

      anonymousLookup.reservations = anonymousReservations.map((reservation) => mapReservationForView(reservation, {
        viewer: 'guest',
        canManage: true,
        managementMode: 'guest',
        lookupEmail,
        lookupReference
      }));
      anonymousLookup.resultCount = anonymousLookup.reservations.length;
    }

    let hint = 'Login to view account-linked reservations, or use the anonymous lookup form below.';
    let reservations = [];
    let reservationTitle = 'Reservations';
    let viewer = 'user';

    if (req.currentUser) {
      const query = req.currentUser.isStaff ? {} : { userId: req.currentUser._id };
      reservationTitle = req.currentUser.isStaff ? 'All Reservations' : 'My Reservations';
      viewer = req.currentUser.isStaff ? 'staff' : 'user';
      hint = req.currentUser.isStaff
        ? `Logged in as staff: ${req.currentUser.name}. You can review and manage all reservations.`
        : `Logged in as ${req.currentUser.name}. Only reservations linked to your account appear here.`;

      const accountReservations = await Reservation.find(query)
        .populate('clinicId')
        .populate('userId')
        .sort({ date: 1, time: 1, createdAt: 1 })
        .lean();

      reservations = accountReservations.map((reservation) => mapReservationForView(reservation, {
        viewer,
        canManage: canManageAccountReservation(req.currentUser, reservation),
        managementMode: 'account',
        showNoShow: req.currentUser.isStaff
      }));
    }

    return res.render('reservations', {
      title: 'VetStappen | Reservations',
      reservationTitle,
      hint,
      timeSlots: TIME_SLOTS,
      services: SERVICES,
      reservations,
      anonymousLookup,
      showLookupResult: anonymousLookup.email && anonymousLookup.referenceCode,
      lookupNotFound: Boolean(anonymousLookup.email && anonymousLookup.referenceCode && anonymousLookup.resultCount === 0),
      isStaffViewer: viewer === 'staff'
    });
  } catch (error) {
    return next(error);
  }
}

async function validateReservationUpdate(reservation, updates) {
  const clinic = await Clinic.findById(reservation.clinicId).lean();
  if (!clinic) {
    return 'The selected clinic could not be found.';
  }

  if (!isReservableDate(updates.date)) {
    return 'Please choose a valid date within the next 7 days.';
  }

  if (!isAllowedValue(updates.time, TIME_SLOTS)) {
    return 'Please choose a valid appointment time.';
  }

  if (!isAllowedValue(updates.service, SERVICES)) {
    return 'Please choose a valid service.';
  }

  if (!isValidSlotForClinic(clinic, updates)) {
    return 'The chosen date, time, and service do not match an available clinic slot.';
  }

  const conflictingReservation = await Reservation.findOne({
    _id: { $ne: reservation._id },
    clinicId: reservation.clinicId,
    date: updates.date,
    time: updates.time,
    service: updates.service,
    status: { $ne: 'Cancelled' }
  }).lean();

  if (conflictingReservation) {
    return 'Another reservation already occupies that slot.';
  }

  return '';
}

async function editReservation(req, res, next) {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation || !canManageAccountReservation(req.currentUser, reservation)) {
      return res.redirect(buildReservationsUrl({ messageType: 'error', message: 'You are not allowed to edit that reservation.' }));
    }

    if (reservation.status !== 'Booked') {
      return res.redirect(buildReservationsUrl({ messageType: 'error', message: 'Only booked reservations can be edited.' }));
    }

    const updates = {
      date: normalizeText(req.body.date),
      time: normalizeText(req.body.time),
      service: normalizeText(req.body.service)
    };

    const validationError = await validateReservationUpdate(reservation, updates);
    if (validationError) {
      return res.redirect(buildReservationsUrl({ messageType: 'error', message: validationError }));
    }

    reservation.date = updates.date;
    reservation.time = updates.time;
    reservation.service = updates.service;
    await reservation.save();

    return res.redirect(buildReservationsUrl({ messageType: 'success', message: 'Reservation updated successfully.' }));
  } catch (error) {
    return next(error);
  }
}

async function cancelReservation(req, res, next) {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation || !canManageAccountReservation(req.currentUser, reservation)) {
      return res.redirect(buildReservationsUrl({ messageType: 'error', message: 'You are not allowed to cancel that reservation.' }));
    }

    if (reservation.status !== 'Booked') {
      return res.redirect(buildReservationsUrl({ messageType: 'error', message: 'Only booked reservations can be cancelled.' }));
    }

    reservation.status = 'Cancelled';
    await reservation.save();
    return res.redirect(buildReservationsUrl({ messageType: 'success', message: 'Reservation cancelled successfully.' }));
  } catch (error) {
    return next(error);
  }
}

async function findAnonymousReservationForManagement(req) {
  const lookupEmail = normalizeEmail(req.body.lookupEmail || req.query.lookupEmail);
  const lookupReference = normalizeText(req.body.lookupReference || req.query.lookupReference).toUpperCase();

  if (!isValidEmail(lookupEmail) || !lookupReference) {
    return {
      error: 'Anonymous reservation management requires the same email and reference code used during booking.',
      lookupEmail,
      lookupReference
    };
  }

  const reservation = await Reservation.findOne({
    _id: req.params.id,
    isAnonymous: true,
    ownerEmail: lookupEmail,
    referenceCode: lookupReference
  });

  if (!reservation) {
    return {
      error: 'The anonymous reservation could not be found. Double-check your email and reference code.',
      lookupEmail,
      lookupReference
    };
  }

  return { reservation, lookupEmail, lookupReference };
}

async function editAnonymousReservation(req, res, next) {
  try {
    const lookupResult = await findAnonymousReservationForManagement(req);
    if (lookupResult.error) {
      return res.redirect(buildReservationsUrl({
        messageType: 'error',
        message: lookupResult.error,
        lookupEmail: lookupResult.lookupEmail,
        lookupReference: lookupResult.lookupReference
      }));
    }

    const { reservation, lookupEmail, lookupReference } = lookupResult;
    if (reservation.status !== 'Booked') {
      return res.redirect(buildReservationsUrl({
        messageType: 'error',
        message: 'Only booked reservations can be edited.',
        lookupEmail,
        lookupReference
      }));
    }

    const updates = {
      date: normalizeText(req.body.date),
      time: normalizeText(req.body.time),
      service: normalizeText(req.body.service)
    };

    const validationError = await validateReservationUpdate(reservation, updates);
    if (validationError) {
      return res.redirect(buildReservationsUrl({
        messageType: 'error',
        message: validationError,
        lookupEmail,
        lookupReference
      }));
    }

    reservation.date = updates.date;
    reservation.time = updates.time;
    reservation.service = updates.service;
    await reservation.save();

    return res.redirect(buildReservationsUrl({
      messageType: 'success',
      message: 'Anonymous reservation updated successfully.',
      lookupEmail,
      lookupReference
    }));
  } catch (error) {
    return next(error);
  }
}

async function cancelAnonymousReservation(req, res, next) {
  try {
    const lookupResult = await findAnonymousReservationForManagement(req);
    if (lookupResult.error) {
      return res.redirect(buildReservationsUrl({
        messageType: 'error',
        message: lookupResult.error,
        lookupEmail: lookupResult.lookupEmail,
        lookupReference: lookupResult.lookupReference
      }));
    }

    const { reservation, lookupEmail, lookupReference } = lookupResult;
    if (reservation.status !== 'Booked') {
      return res.redirect(buildReservationsUrl({
        messageType: 'error',
        message: 'Only booked reservations can be cancelled.',
        lookupEmail,
        lookupReference
      }));
    }

    reservation.status = 'Cancelled';
    await reservation.save();

    return res.redirect(buildReservationsUrl({
      messageType: 'success',
      message: 'Anonymous reservation cancelled successfully.',
      lookupEmail,
      lookupReference
    }));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  renderReservations,
  editReservation,
  cancelReservation,
  editAnonymousReservation,
  cancelAnonymousReservation
};
