const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../auth');
const { USER_ROLES } = require('../constants');
const { validate, userSchema } = require('../validation/zod');
const route = express.Router();

route.get('/',authorize([USER_ROLES.ADMIN]),userController.getAllUsers)
route.get('/:id',authorize([USER_ROLES.ADMIN]),userController.getUserById)
route.patch('/:id',validate(userSchema.update),userController.updateUser)
route.delete('/:id',userController.deleteUser)

module.exports = route;