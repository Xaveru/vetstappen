const { PASSWORD_MIN_LENGTH } = require('./constants');
const { getNextDates, isValidISODate } = require('./dates');

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeText(value) {
  return String(value || '').trim();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function isAllowedValue(value, allowedValues) {
  return allowedValues.includes(String(value || ''));
}

function isReservableDate(value) {
  return isValidISODate(value) && getNextDates(7).includes(String(value));
}

function validatePasswordStrength(password) {
  const safePassword = String(password || '');
  if (safePassword.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  }

  const hasLetter = /[A-Za-z]/.test(safePassword);
  const hasDigit = /\d/.test(safePassword);
  if (!hasLetter || !hasDigit) {
    return 'Password must contain at least one letter and one number.';
  }

  return '';
}

module.exports = {
  normalizeEmail,
  normalizeText,
  isValidEmail,
  isAllowedValue,
  isReservableDate,
  validatePasswordStrength
};
