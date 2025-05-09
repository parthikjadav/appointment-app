// function generateSlots(startTimeStr, endTimeStr, intervalMinutes = 30) {
//     const slots = [];

//     const startTime = new Date(startTimeStr);
//     const endTime = new Date(endTimeStr);
//     let current = new Date(startTime);

//     // Round current time to the next interval
//     const minutes = current.getMinutes();
//     if (minutes % intervalMinutes !== 0) {
//         const nextMinutes = minutes + (intervalMinutes - (minutes % intervalMinutes));
//         current.setMinutes(nextMinutes);
//     }
//     current.setSeconds(0, 0);

//     const formatTime = (date) => {
//         return date.toTimeString().slice(0, 5); // Format as "HH:MM"
//     };

//     while (current.getTime() + intervalMinutes * 60000 <= endTime.getTime()) {
//         const slotStart = new Date(current);
//         const slotEnd = new Date(current.getTime() + intervalMinutes * 60000);

//         slots.push({
//             from: formatTime(slotStart),
//             to: formatTime(slotEnd),
//             startFullDate: slotStart,
//             endFullDate: slotEnd,
//         });

//         current = slotEnd;
//     }

//     return slots;
// }
// console.log(generateSlots("2025-05-07T04:00:00.000Z","2025-05-07T04:30:00.000Z"));

const now = new Date();
const temp = new Date(2025, 4, 8, 12, 40, 0, 0);

console.log(now);
console.log(now.toString());
console.log(temp);
console.log(temp.toString());


// console.log(temp.toString());

