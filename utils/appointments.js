const { TIME_SLOTS, SERVICES } = require('./constants');
const { getNextDates } = require('./dates');

function slotKey({ clinicId, date, time, service }) {
  return `${String(clinicId)}|${date}|${time}|${service}`;
}

function generateSlots(clinic) {
  const nextSevenDates = getNextDates(7);
  const slots = [];

  nextSevenDates.forEach((date, dayIndex) => {
    TIME_SLOTS.forEach((time, timeIndex) => {
      const service = SERVICES[(dayIndex + timeIndex) % SERVICES.length];
      slots.push({
        clinicId: String(clinic._id),
        clinicName: clinic.name,
        clinicLocation: clinic.location,
        date,
        time,
        service,
        slotId: `${clinic._id}|${date}|${time}|${service}`
      });
    });
  });

  return slots;
}

function isValidSlotForClinic(clinic, selection) {
  return generateSlots(clinic).some((slot) => (
    slot.date === String(selection.date)
      && slot.time === String(selection.time)
      && slot.service === String(selection.service)
  ));
}

module.exports = {
  slotKey,
  generateSlots,
  isValidSlotForClinic
};
