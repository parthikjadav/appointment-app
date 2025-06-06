const express = require('express');
const profileController = require('../controllers/profile.controller');
const { authenticate, authorize } = require('../auth');
const { USER_ROLES } = require('../constants');
const { validate, profileSchema, validateParams, paramIdSchema, serviceSchema } = require('../validation/zod');
const serviceController = require('../controllers/service.controller');
const route = express.Router();

// TODO: professional can create profile and see only their profile and admin can see all profiles and also update and delete any profile and get profile by id
// add routes for creating, updating, deleting and getting profile by id
route.get('/:id', authorize([USER_ROLES.PROFESSIONAL,USER_ROLES.ADMIN]), validateParams(paramIdSchema),profileController.getUserProfileById)
route.get('/', authorize([USER_ROLES.ADMIN]), profileController.getAllUsersProfile)
route.patch("/timing/:id", validateParams(paramIdSchema),validate(serviceSchema.updateTiming), serviceController.updateServiceTiming)
route.post("/", authorize([USER_ROLES.PROFESSIONAL,USER_ROLES.ADMIN]),validate(profileSchema.create), profileController.createProfile)
route.patch("/:id", authorize([USER_ROLES.PROFESSIONAL,USER_ROLES.ADMIN]),validateParams(paramIdSchema),validate(profileSchema.update), profileController.updateProfile)
route.delete("/:id", authorize([USER_ROLES.PROFESSIONAL,USER_ROLES.ADMIN]),validateParams(paramIdSchema), profileController.deleteProfile)

module.exports = route;