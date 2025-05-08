const express = require('express');
const serviceController = require('../controllers/service.controller');
const { authenticate, authorize } = require('../auth');
const { USER_ROLES } = require('../constants');
const { validateParams, paramIdSchema, validate, serviceSchema } = require('../validation/zod');
const route = express.Router();

route.get('/:id',validateParams(paramIdSchema), serviceController.getServiceById)
route.get('/', serviceController.getAllServices)
route.post('/', validate(serviceSchema.create), serviceController.createService)
route.patch("/:id", validateParams(paramIdSchema), validate(serviceSchema.update), serviceController.updateService)
route.delete("/:id", validateParams(paramIdSchema), serviceController.deleteService)

module.exports = route;