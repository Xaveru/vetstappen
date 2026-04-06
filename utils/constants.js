const TIME_SLOTS = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '04:00 PM'];
const SERVICES = ['Consultation', 'Vaccination', 'Grooming', 'Surgery', 'Emergency Care'];
const RESERVATION_STATUSES = ['Booked', 'Cancelled', 'No-show'];
const PASSWORD_MIN_LENGTH = 8;
const BIO_MAX_LENGTH = 280;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

module.exports = {
  TIME_SLOTS,
  SERVICES,
  RESERVATION_STATUSES,
  PASSWORD_MIN_LENGTH,
  BIO_MAX_LENGTH,
  SESSION_TTL_MS
};
