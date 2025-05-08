const express = require('express');
const { authenticate, authorize } = require('../auth');
const appointmentController = require('../controllers/appointment.controller');
const { validate, appointmentSchema } = require('../validation/zod');
const { USER_ROLES } = require('../constants');
const route = express.Router();

route.get('/', authenticate, appointmentController.getAllAppointments)
route.patch("/cancel/:appointmentId",authenticate, appointmentController.cancelAppointment)
route.patch("/accept/:appointmentId",authenticate,authorize([USER_ROLES.ADMIN,USER_ROLES.PROFESSIONAL]), appointmentController.acceptAppointment)
route.post("/slots", authenticate, validate(appointmentSchema.slots), appointmentController.getAllFreeSlots)
route.post("/", authenticate, validate(appointmentSchema.create), appointmentController.createAppointment)

module.exports = route;