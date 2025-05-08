const expressAsyncHandler = require("express-async-handler");
const { AppError } = require("../utils/response");
const { USER_ROLES, APPOINTMENT_STATUS } = require("../constants");
const prisma = require("../utils/prisma.util");
const generateSlots = require("../utils");
const { canCancelAppointment } = require("../utils/reusable");
const event = require("../utils/eventEmitter");

const appointmentService = {
    getAppointments: expressAsyncHandler(async (req, res) => {
        try {
            if (req.user.role !== USER_ROLES.ADMIN) {
                const appointments = await prisma.appointment.findMany({
                    where: {
                        userId: req.user.id
                    }
                })
                if (appointments.length === 0) {
                    return new AppError(res, 404, 'No appointments found');
                }
                return appointments;
            }
            const appointments = await prisma.appointment.findMany({
                include: {
                    service: true,
                    user: true,
                    professional: true
                }
            })
            if (appointments.length === 0) {
                return new AppError(res, 404, 'No appointments found');
            }
            return appointments;
        } catch (error) {
            return new AppError(res, 500, 'Failed to get appointments', error.message);
        }
    }),
    createAppointment: expressAsyncHandler(async (req, res) => {
        try {
            const { userId, serviceId, professionalId, from, to } = req.body
            const appointments = await prisma.appointment.findMany({
                where: {
                    professionalId,
                    status: APPOINTMENT_STATUS.APPROVED
                }
            })
            const newSlot = generateSlots(from, to)

            if (!newSlot[0]) {
                return new AppError(res, 400, 'Invalid slot');
            } else if (newSlot[0].startFullDate.getMinutes() + newSlot[0].endFullDate.getMinutes() != 30) {
                return new AppError(res, 400, 'Invalid slot, slot must be at least 30 minutes');
            } else if (newSlot.length > 1) {
                return new AppError(res, 400, 'Invalid slot, you can not book more than one slot at a time');
            }
            const bookedSlots = appointments.map(appointment => {
                return generateSlots(appointment.from, appointment.to)
            })
            
            const isAlreadyBooked = bookedSlots.flat().find((slot) => {
                return new Date(slot.startFullDate).getTime() === new Date(newSlot[0].startFullDate).getTime() &&
                    new Date(slot.endFullDate).getTime() === new Date(newSlot[0].endFullDate).getTime()
            })

            if (isAlreadyBooked) {
                return new AppError(res, 400, 'This slot is already booked');
            }
            const appointment = await prisma.appointment.create({
                data: {
                    userId,
                    serviceId,
                    professionalId,
                    from,
                    to
                },
                include: {
                    service: true,
                    user: true,
                    professional: true
                },
            })
            if (!appointment) {
                return new AppError(res, 400, 'Failed to create appointment');
            }
            delete appointment.user.password
            delete appointment.professional.password
            event.emit('appointment:created', appointment)
            return appointment;
        } catch (error) {
            console.log(error);

            return new AppError(res, 500, 'Failed to create appointment', error.message);
        }
    }),
    getFreeSlots: expressAsyncHandler(async (req, res) => {
        try {
            const { professionalId, date } = req.body
            const day = new Date(date).getDay()
            
            const profile = await prisma.profile.findUnique({
                where: {
                    userId: professionalId
                },
                include: {
                    timings: true
                }
            })
            
            if (!profile) {
                return new AppError(res, 400, 'Profile not found');
            }
            const isAvailable = profile.timings.find(timing => timing.day === day)
            if (!isAvailable) {
                return new AppError(res, 400, 'Oops! , Service is not available on this date');
            }

            const slots = generateSlots(isAvailable.startTime, isAvailable.endTime)

            let bookedSlots = await prisma.appointment.findMany({
                where: {
                    professionalId,
                    status: APPOINTMENT_STATUS.APPROVED
                },
            })

            bookedSlots = bookedSlots.map(appointment => {
                return generateSlots(appointment.from, appointment.to)
            })

            bookedSlots = bookedSlots.flat()

            const freeSlots = slots.filter(slot => {
                const isAlreadyBookedSlot = bookedSlots.find(bslot => {
                    return new Date(bslot.startFullDate).getTime() === new Date(slot.startFullDate).getTime()
                })

                if (!isAlreadyBookedSlot) {
                    return slot;
                }
            })

            return freeSlots;
        } catch (error) {
            return new AppError(res, 500, 'Failed to get free slots', error.message);
        }
    }),
    cancelAppointment: expressAsyncHandler(async (req, res) => {
        try {
            const { appointmentId } = req.params;
            const { id } = req.user;

            const appointment = await prisma.appointment.findUnique({
                where: {
                    id: appointmentId
                },
                include: {
                    user: true,
                    professional:true,
                }
            })

            if (!appointment) {
                return new AppError(res, 404, 'Appointment not found');
            }

            if (req.user.role === USER_ROLES.USER) {
                if (appointment.userId !== id) {
                    return new AppError(res, 403, 'You are not authorized to cancel this appointment');
                }

                if (!canCancelAppointment(appointment.from)) {
                    return new AppError(res, 400, 'You can not cancel an appointment, that is starting soon!');
                }
            } else if (req.user.role === USER_ROLES.PROFESSIONAL) {
                if(appointment.status === APPOINTMENT_STATUS.APPROVED){
                    return new AppError(res, 400, 'You can not cancel an appointment, after approving it.');
                }else if(appointment.professionalId !== id){
                    return new AppError(res, 403, 'You are not authorized to cancel this appointment');
                }
            }

            const updated = await prisma.appointment.update({
                where: {
                    id: appointmentId
                },
                data: {
                    status: APPOINTMENT_STATUS.REJECTED
                }
            })
            event.emit('appointment:cancelled',appointment);
            return updated;
        } catch (error) {
            return new AppError(res, 500, 'Failed to cancel appointment', error.message);
        }
    }),
    acceptAppointment: expressAsyncHandler(async (req, res) => {
        try {
            const { appointmentId } = req.params;
            const id = req.user.id;

            const appointment = await prisma.appointment.findUnique({
                where: {
                    id: appointmentId
                },
                include: {
                    professional: true,
                    user: true
                }
            })

            if (!appointment) {
                return new AppError(res, 404, 'Appointment not found');
            }

            if(req.user.role === USER_ROLES.PROFESSIONAL){
                if (appointment.professionalId !== id) {
                    return new AppError(res, 403, 'You are not authorized to accept this appointment');
                }
            }

            const updated = await prisma.appointment.update({
                where: {
                    id: appointmentId
                },
                data: {
                    status: APPOINTMENT_STATUS.APPROVED
                }
            })
            event.emit('appointment:accepted', appointment)
            return updated
        } catch (error) {
            return new AppError(res, 500, 'Failed to accept appointment', error.message);
        }
    })
}

module.exports = appointmentService;