function pad2(value) {
  return String(value).padStart(2, '0');
}

function toISODate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function addDays(baseDate, days) {
  const result = new Date(baseDate);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + days);
  return result;
}

function getNextDates(count = 7, baseDate = new Date()) {
  return Array.from({ length: count }, (_, index) => toISODate(addDays(baseDate, index)));
}

function isValidISODate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

module.exports = {
  pad2,
  toISODate,
  addDays,
  getNextDates,
  isValidISODate
};
