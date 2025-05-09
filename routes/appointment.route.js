const express = require('express');
const { authorize } = require('../auth');
const appointmentController = require('../controllers/appointment.controller');
const { validate, appointmentSchema } = require('../validation/zod');
const { USER_ROLES } = require('../constants');
const route = express.Router();

route.get('/', appointmentController.getAllAppointments)
route.patch("/cancel/:appointmentId", appointmentController.cancelAppointment)
route.patch("/accept/:appointmentId",authorize([USER_ROLES.ADMIN,USER_ROLES.PROFESSIONAL]), appointmentController.acceptAppointment)
route.post("/slots", validate(appointmentSchema.slots), appointmentController.getAllFreeSlots)
route.post("/reschedule", authorize([USER_ROLES.ADMIN,USER_ROLES.USER]), validate(appointmentSchema.reschedule), appointmentController.rescheduleAppointment)
route.post("/complete/:appointmentId", authorize([USER_ROLES.ADMIN,USER_ROLES.PROFESSIONAL]), appointmentController.completeAppointment)
route.post("/", validate(appointmentSchema.create), appointmentController.createAppointment)

module.exports = route;