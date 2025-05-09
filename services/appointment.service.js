const expressAsyncHandler = require("express-async-handler");
const { USER_ROLES, APPOINTMENT_STATUS } = require("../constants");
// utils
const generateSlots = require("../utils");
const prisma = require("../utils/prisma.util");
const event = require("../utils/eventEmitter");
const { AppError } = require("../utils/response");
const { canCancelAppointment } = require("../utils/reusable");
const { createPaymentIntent, stripe } = require("../utils/stripe");

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
            const service = await prisma.service.findUnique({
                where: {
                    id: serviceId
                }
            })
            if (!service) {
                return new AppError(res, 404, 'Service not found');
            }
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
            appointment.payment_url = await createPaymentIntent(service.price, appointment.id)
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
                    professional: true,
                }
            })

            if (!appointment || !appointment.paymentIntentId) {
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
                if (appointment.status === APPOINTMENT_STATUS.APPROVED) {
                    return new AppError(res, 400, 'You can not cancel an appointment, after approving it.');
                } else if (appointment.professionalId !== id) {
                    return new AppError(res, 403, 'You are not authorized to cancel this appointment');
                }
            }

            if (appointment.isRefunded) {
                return new AppError(res, 400, 'This appointment has cancelled and already been refunded');
            }

            try {
                const refund = await stripe.refunds.create({
                    payment_intent: appointment.paymentIntentId
                })

                await prisma.appointment.update({
                    where: {
                        id: appointmentId
                    },
                    data: {
                        isRefunded: true,
                        refundId: refund.id
                    }
                })
            } catch (error) {
                console.error('Refund failed:', error.message);
                return res.status(500).json({ error: 'Refund failed' });
            }
            const updated = await prisma.appointment.update({
                where: {
                    id: appointmentId
                },
                data: {
                    status: APPOINTMENT_STATUS.REJECTED
                }
            })
            event.emit('appointment:cancelled', appointment);
            event.emit('appointment:refunded', appointment);
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

            if (req.user.role === USER_ROLES.PROFESSIONAL) {
                if (appointment.professionalId !== id) {
                    return new AppError(res, 403, 'You are not authorized to accept this appointment');
                }
            }
            if (!appointment.isPaid || appointment.isRefunded) {
                return new AppError(res, 403, 'You can not accept this appointment');
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
    }),
    rescheduleAppointment: expressAsyncHandler(async (req, res) => {
        try {
            const { appointmentId, from, to } = req.body;
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

            if (req.user.role === USER_ROLES.USER) {
                if (appointment.user.id !== req.user.id) {
                    return new AppError(res, 403, 'You are not authorized to reschedule this appointment');
                }
            }

            if (!canCancelAppointment(appointment.from)) {
                return new AppError(res, 400, 'You can only cancel appointment 15 Minutes before');
            }

            const updatedAppointment = await prisma.appointment.update({
                where: {
                    id: appointmentId
                },
                data: {
                    from,
                    to
                },
                include: {
                    professional: true,
                    user: true
                }
            })

            if (!updatedAppointment) {
                return new AppError(res, 500, 'Failed to reschedule appointment');
            }
            event.emit('appointment:rescheduled', updatedAppointment);
            return updatedAppointment;
        } catch (error) {
            return new AppError(res, 500, 'Failed to reschedule appointment', error.message);
        }
    }),
    completeAppointment: expressAsyncHandler(async (req, res) => {
        try {
            const { appointmentId } = req.params;
            const { role, id } = req.user;

            if (!appointmentId) {
                return new AppError(res, 400, 'Appointment ID is required');
            }

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

            if (role === USER_ROLES.PROFESSIONAL) {
                if (appointment.professionalId !== id) {
                    return new AppError(res, 403, 'You are not authorized to complete this appointment');
                }
            }

            if (appointment.status !== APPOINTMENT_STATUS.APPROVED || !appointment.isPaid || appointment.isRefunded) {
                return new AppError(res, 400, 'You can not mark this appointment as completed');
            }

            const updatedAppointment = await prisma.appointment.update({
                where: {
                    id: appointmentId
                },
                data: {
                    status: APPOINTMENT_STATUS.COMPLETED
                }
            })

            return updatedAppointment;
        } catch (error) {
            return new AppError(res, 500, 'Failed to complete appointment', error.message);
        }
    }),
}

module.exports = appointmentService;