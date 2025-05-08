const express = require('express');
const routes = express.Router();

const { authenticate, authorize } = require('../auth');
const { USER_ROLES } = require('../constants');

// routes
const userRoute = require("./user.route")
const authRoute = require("./auth.route")
const serviceRoute = require("./service.route")
const profileRoute = require("./profile.route");
const appointmentRoute = require("./appointment.route")

routes.use("/auth",authRoute)
routes.use("/user",authenticate,userRoute)
routes.use("/service",authenticate, authorize([USER_ROLES.ADMIN,USER_ROLES.PROFESSIONAL]),serviceRoute)
routes.use("/profile",authenticate,profileRoute)
routes.use("/appointment",authenticate,appointmentRoute)

module.exports = routes;