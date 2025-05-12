const express = require('express');
const routes = express.Router();

const { authenticate, authorize } = require('../auth');
const { USER_ROLES } = require('../constants');

// routes
const userRoute = require("./user.route")
const authRoute = require("./auth.route")
const serviceRoute = require("./service.route")
const reviewRoute = require("./review.route")
const profileRoute = require("./profile.route");
const appointmentRoute = require("./appointment.route");
const chatRoute = require("./chat.route");

routes.use("/auth",authRoute)
routes.use("/user",authenticate,userRoute)
routes.use("/service",authenticate,serviceRoute)
routes.use("/review",authenticate,reviewRoute)
routes.use("/chat",authenticate,chatRoute)
routes.use("/profile",authenticate,profileRoute)
routes.use("/appointment",authenticate,appointmentRoute)

module.exports = routes;