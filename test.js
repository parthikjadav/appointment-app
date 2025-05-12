// function generateSlots(startTimeStr, endTimeStr, intervalMinutes = 30) {
//     const slots = [];

// const prisma = require("./utils/prisma.util");

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

// const now = new Date();
// const temp = new Date(2025, 4, 8, 12, 40, 0, 0);

// console.log(now);
// console.log(now.toString());
// console.log(temp);
// console.log(temp.toString());


// console.log(temp.toString());

// const main = async () => {
//     console.time("here");

//     const appointments = await prisma.appointment.groupBy({
//         by: ["serviceId"],
//         _count: {
//             serviceId: true
//         },
//         orderBy: {
//             _count: {
//                 serviceId: "desc"
//             }
//         }
//     })

//     const countMap = {}
//     appointments.filter((item) => {
//         countMap[item.serviceId] = item._count.serviceId
//     })
//     console.log(countMap);

//     let services = await prisma.service.findMany({})
//     services.sort((a, b) => {
//         if (countMap[a.id] > countMap[b.id]) {
//             return -1;
//         } else {
//             return 1;
//         }
//     })
//     console.timeEnd("here")
// }

// main();
const { GoogleGenAI, Type } = require("@google/genai")
const prisma = require("./utils/prisma.util")
const systemPrompt = require("./constants/systemPrompt")
const { default: axios } = require("axios")
const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyBmOvRIBUX2BKlnXC6AZpo--Ht-E8lUhPc'
const ai = new GoogleGenAI({ apiKey })

const main = async () => {
//     const serviceId = 'cmagpoadx00071lm0cmc8isx2'
//     const professionalId = '98366cf1-9fd8-4165-8bfc-0a21b96f56cd'
//     const getServiceById = async (id) => {
//         return await prisma.service.findUnique({
//             where: {
//                 id
//             }
//         })
//     }

//     const getServiceDetailsDeclaration = {
//         name: "get_service_details",
//         description: "if someone provides service id and tells about i want info about or any detail about that service immediately call this function Get service details call this function with service id to get service object from database",
//         parameters: {
//             type: Type.OBJECT,
//             properties: {
//                 serviceId: {
//                     type: Type.STRING,
//                     description: "Service id to get service object from database",
//                 },
//             },
//             required: ["serviceId"],
//         }
//     }
//     const getFreeSlotsForSpecificServiceDeclaration = {
//         name: "get_free_slots_for_specific_service",
//         description: "if someone tells about i want to get free slots and he provides the professionalId and the The date as well then related to it or he want to know about free slots for specific service immediately call this function Get free slots for specific service call this function with professionalId and date to get free slots for specific service, and if user provide date in any format then convert it into this format YYYY-MM-DD, and if user want to get free slots but he doesn't know about it,  but if he doesn't provide the date or professionalId then tell him to provide the date and professional id",
//         parameters: {
//             type: Type.OBJECT,
//             properties: {
//                 professionalId: {
//                     type: Type.STRING,
//                     description: "professional id to get free slots for specific service",
//                 },
//                 date: {
//                     type: Type.STRING,
//                     description: "Date to get free slots for specific service",
//                 },
//             },
//             required: ["professionalId", "date"],
//         }
//     }

//     const contents = [
//         {
//             role: 'user',
//             parts: [{ text: `can you tell me about this serviceID: ${serviceId}` }]
//         }
//     ];

//     const response = await ai.models.generateContent({
//         model: "gemini-2.0-flash",
//         contents,
//         config: {
//             tools: [{
//                 functionDeclarations: [getServiceDetailsDeclaration, getFreeSlotsForSpecificServiceDeclaration],
//             }]
//         }
//     })

//     // Check for function calls in the response
//     if (response.functionCalls && response.functionCalls.length > 0) {
//         const functionCall = response.functionCalls[0]; // Assuming one function call
//         console.log(`Function to call: ${functionCall.name}`);
//         console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);
//         switch (functionCall.name) {
//             case "get_service_details":
//                 try {
//                     const result = await getServiceById(functionCall.args.serviceId);
//                     if (!result) {
//                         console.log("No service found with the given ID");
//                         break;
//                     }
//                     const response = await ai.models.generateContent({
//                         model: "gemini-2.0-flash",
//                         systemInstructions: systemPrompt,
//                         contents: `give the two line short and sweet overview of this service don't include keywords like here is the overview of something like that give straight answer and don't format it using * or ** or anything else Service Title:${result.title}, Description:${result.description}, Price:${result.price}`
//                     })
//                     console.log(response.text);
//                 } catch (error) {
//                     console.log("Failed to get service details", error.message);
//                 }
//                 break;
//             case "get_free_slots_for_specific_service":
//                 try {
//                     const { date, professionalId } = functionCall.args;
//                     const freeSlots = await axios.post("http://localhost:3000/api/appointment/slots", {
//                         professionalId,
//                         date,
//                     })
//                     if (freeSlots.status !== 200) {
//                         console.log("No free slots found for the given date and professional")
//                         break;
//                     }
//                     const freeSlotRefinedResponse = await ai.models.generateContent({
//                         model: "gemini-2.0-flash",
//                         systemInstructions: systemPrompt,
//                         contents: `give the free slots for this professional free slots data in good format so user can read it easily and don't use any keywords like here is your dates and all just greet the user if required and dont user any formating charachters ${JSON.stringify(freeSlots.data)}`
//                     })
//                     console.log(freeSlotRefinedResponse.text);
//                 } catch (error) {
//                     console.log("Failed to fetch free slots for that specific date and professional", error.message);
//                 }
//                 break;
//             default:
//                 console.log(`Unknown function call: ${functionCall.name}`);
//         }
//     } else {
//         console.log("No function call found in the response.");
//         console.log(response.text);
//     }
// }
// console.log(new Date(2025, 0,1));
    //   const funcCall = "greet" 
    //   const hello = {
    //       greet: (name) => {
    //           console.log("Hello " + name)
    //       }
    //   }
    //   if(hello[funcCall]){
    //       hello[funcCall]("parthik");
    //   } else {
    //       console.log("No function call found in the response.")
    //   }
    
}

main();