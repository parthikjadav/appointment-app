const expressAsyncHandler = require("express-async-handler");
const prisma = require("../utils/prisma.util");
const { GoogleGenAI, Type } = require("@google/genai");
const { AppError, AppResponse } = require("../utils/response");
const systemPrompt = require("../constants/systemPrompt");
const { cleanGeminiText } = require("../utils/reusable");
const { getServiceById, getServiceDetailsDeclaration, getFreeSlotsForSpecificServiceDeclaration, bookAppointmentDeclaration, getFreeSlots, bookAppointment, acceptAppointmentRequestDeclaration, acceptAppointmentRequest } = require("../utils/chat/chat.modules");
const { env } = require("../constants");
const apiKey = process.env.GOOGLE_API_KEY
const ai = new GoogleGenAI({ apiKey })
const chatService = {
    getServiceDetails: expressAsyncHandler(async (req, res) => {
        try {
            const { serviceId = null, query = '', professionalId = null, userId = null, from = null, to = null, appointmentId = null } = req.body;
            const contents = [
                {
                    role: 'user',
                    parts: [{
                        text: `Could you please ignore the extra fields Strictly Follow This Instructions: If there is any other extra field just ignore it and do what user says to do and decide the which function to call based on the provided values and user may proovide date and other values in query so check it first System Instructions:  if the required field is null only then send the response and tell provide the required id for example serviceId if the extra field is provided ignore it and only notice the required details only  
                        Query:${query} UserId:${userId} ServiceId: ${serviceId} AppointmentId:${appointmentId} ProfessionalId:${professionalId} From:${from} To:${to}`
                    }]
                }
            ];

            const response = await ai.models.generateContent({
                model: env.GEMINI_MODEL,
                contents,
                config: {
                    tools: [{
                        functionDeclarations: [getServiceDetailsDeclaration, getFreeSlotsForSpecificServiceDeclaration, bookAppointmentDeclaration, acceptAppointmentRequestDeclaration],
                    }]
                }
            })
            console.log(response.text);

            const functionHandlers = {
                "get_service_details": async (args) => {
                    const result = await getServiceById(args.serviceId);
                    const response = await ai.models.generateContent({
                        model: env.GEMINI_MODEL,
                        systemInstructions: systemPrompt,
                        contents: `give the two line short and sweet overview of this service don't include keywords like here is the overview of something like that give straight answer and don't format it using * or ** or anything else Service Title:${result.title}, Description:${result.description}, Price:${result.price}`
                    })
                    const overview = cleanGeminiText(response.text);
                    return overview;
                },
                "get_free_slots_for_specific_service": async (args) => {
                    const { date, professionalId } = args;
                    const freeSlots = await getFreeSlots(professionalId, date, req.user.id)

                    const freeSlotRefinedResponse = await ai.models.generateContent({
                        model: env.GEMINI_MODEL,
                        systemInstructions: systemPrompt,
                        contents: `give the free slots for this professional free slots data in good format so user can read it easily and don't use any keywords like here is your dates and all and don't user any formatting characters ${JSON.stringify(freeSlots.data)}`
                    })

                    return freeSlotRefinedResponse.text;
                },
                "book_appointment": async (args) => {
                    const appointment = await bookAppointment({ ...args, apiKey: userId })
                    const response = await ai.models.generateContent({
                        model: env.GEMINI_MODEL,
                        systemInstructions: systemPrompt,
                        contents: `tell user about the data we get from the db if there is error then tell the user how to correct it and if the appointment is booked successfully then tell the user about the timing of the appointment and some short message do not say anything else like here is or any example just do what i said ${JSON.stringify(appointment)}`
                    })
                    return response.text;
                },
                "accept_appointment_request": async (args) => {
                    const appointment = await acceptAppointmentRequest({ ...args, apiKey: req.user.id })
                    const response = await ai.models.generateContent({
                        model: env.GEMINI_MODEL,
                        systemInstructions: systemPrompt,
                        contents: `tell user about if response is success then the appointment request is successfully accepted if there is any error then tell about that to the user and do not say anything else just say message and some appointment details like time and status to the user so user can understand it is accepted or not ${JSON.stringify(appointment)}`
                    })
                    return response.text;
                }
            }

            if (response.functionCalls) {
                console.log("Called function:", response.functionCalls[0].name);
                console.log("Passed this args:", response.functionCalls[0].args);

                const functionCall = response.functionCalls[0];
                if (functionHandlers[functionCall.name]) return await functionHandlers[functionCall.name](functionCall.args);
            } else {
                return new AppResponse(res, 200, "No function call found in the response.", finalAnswer)
            }
        } catch (error) {
            return new AppError(res, 500, 'Error Chating with AI', error.message)
        }
    })
}

module.exports = chatService;