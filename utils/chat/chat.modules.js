const { Type } = require("@google/genai")
const { env } = require("../../constants")

const getServiceDetailsDeclaration = {
    name: "get_service_details",
    description: "if someone provides service id and tells about i want info about or any detail about that service immediately call this function Get service details call this function with service id to get service object from database",
    parameters: {
        type: Type.OBJECT,
        properties: {
            serviceId: {
                type: Type.STRING,
                description: "Service id to get service object from database",
            },
        },
        required: ["serviceId"],
    }
}
const getFreeSlotsForSpecificServiceDeclaration = {
    name: "get_free_slots_for_specific_service",
    description: "if someone tells about i want to get free slots and he provides the professionalId and the The date as well then related to it or he want to know about free slots for specific service immediately call this function Get free slots for specific service call this function with professionalId and date to get free slots for specific service, and if user provide date in any format then convert it into this format YYYY-MM-DD, and if user want to get free slots but he doesn't know about it,  but if he doesn't provide the date or professionalId then tell him to provide the date and professional id",
    parameters: {
        type: Type.OBJECT,
        properties: {
            professionalId: {
                type: Type.STRING,
                description: "professional id to get free slots for specific service",
            },
            date: {
                type: Type.STRING,
                description: "Date to get free slots for specific service",
            },
        },
        required: ["professionalId", "date"],
    }
}

const acceptAppointmentRequestDeclaration = {
    name: 'accept_appointment_request',
    description: 'Accept an appointment request for a specific service by a professional the required fields are userId, and appointmentId if any other fields are provided then ignore them',
    parameters: {
        type: Type.OBJECT,
        properties: {
            userId: {
                type: Type.STRING,
                description: "user id to accept appointment request for specific service",
            },
            appointmentId: {
                type: Type.STRING,
                description: "appointment id to accept appointment request for specific service",
            },
        },
        required: ["userId", "appointmentId"],
    }
}

const bookAppointmentDeclaration = {
    name: 'book_appointment',
    description: 'Book an appointment for a specific service and professional the userId serviceId and the professionalId is required if any of them is not provided then ask the user to provide it first and also user needs to provide the date and time of the appointment from, end field are required and if the user provides it in another format then format that both in this format:"2024-12-31T18:30:00.000Z" and if the from or to datetime is invalid ask them to provide a valid datetime and only pass the arguments listed down below (userId,professionalId,serviceId,from,to) and do not rename it strictly pass only this arguments',
    parameters: {
        type: Type.OBJECT,
        properties: {
            userId: {
                type: Type.STRING,
                description: "user id to book an appointment for specific service",
            },
            serviceId: {
                type: Type.STRING,
                description: "service id to book an appointment for specific service",
            },
            professionalId: {
                type: Type.STRING,
                description: "professional id to book an appointment for specific service",
            },
            from: {
                type: Type.STRING,
                description: "from datetime of the appointment",
            },
            to: {
                type: Type.STRING,
                description: "to datetime of the appointment",
            }
        },
        required: ['userId', 'serviceId', 'professionalId', 'from', 'to'],
    },
}

const getFreeSlots = async (professionalId, date, apiKey) => {
    try {
        let freeSlots = await (await fetch(`${env.BASE_URL}/api/appointment/slots`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                professionalId,
                date,
                apiKey
            })
        })).json()

        if (!freeSlots.success) {
            throw new Error(freeSlots.message)
        }
        return freeSlots;
    } catch (error) {
        throw new Error(error.message)
    }
}

const getServiceById = async (id) => {
    const service = await prisma.service.findUnique({
        where: {
            id
        }
    })
    if (!service) throw new Error("Service not found")

    return service
}

const bookAppointment = async (data) => {
    try {
        const { userId, serviceId, professionalId, from, to, apiKey } = data;

        const appointment = await (await fetch(`${env.BASE_URL}/api/appointment/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
                serviceId,
                professionalId,
                from,
                to,
                apiKey
            })
        })).json()

        if (!appointment.success) {
            throw new Error(appointment.message)
        }
        return appointment;
    } catch (error) {
        throw new Error(error.message)
    }
}

const acceptAppointmentRequest = async (data) => {
    try {
        const { userId, appointmentId, apiKey } = data;

        const appointment = await (await fetch(`${env.BASE_URL}/api/appointment/accept`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
                appointmentId,
                apiKey
            })
        })).json()

        if (!appointment.success) {
            throw new Error(appointment.message)
        }
        return appointment;
    } catch (error) {
        throw new Error(error.message)
    }
}

module.exports = {
    getFreeSlotsForSpecificServiceDeclaration,
    bookAppointmentDeclaration,
    getServiceDetailsDeclaration,
    acceptAppointmentRequestDeclaration,
    getServiceById,
    getFreeSlots,
    bookAppointment,
    acceptAppointmentRequest
};