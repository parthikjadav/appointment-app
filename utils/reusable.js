const { isBefore, subMinutes } = require('date-fns');

function canCancelAppointment(appointmentStartTime) {
    const now = new Date();
    const cutoffTime = subMinutes(new Date(appointmentStartTime), 15);
    return isBefore(now, cutoffTime);
}
function cleanGeminiText(text) {
    return text
        .replace(/\\n/g, ' ')     
        .replace(/\n/g, ' ')      
        .replace(/\\t/g, ' ')    
        .replace(/\s+/g, ' ')     
        .trim();
}


module.exports = { canCancelAppointment,cleanGeminiText };