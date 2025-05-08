const { isBefore, subMinutes } = require('date-fns');

function canCancelAppointment(appointmentStartTime) {
    const now = new Date();
    const cutoffTime = subMinutes(new Date(appointmentStartTime), 15);

    return isBefore(now, cutoffTime);
}

module.exports = { canCancelAppointment };