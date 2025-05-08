const express = require('express');
const authController = require('../controllers/auth.controller');
const { validate, userSchema } = require('../validation/zod');
const { authenticate } = require('../auth');
const route = express.Router();

route.get("/user", authenticate, authController.getUser)
route.post('/sign-up',validate(userSchema.create),authController.signUp)
route.post('/sign-in',validate(userSchema.signIn),authController.signIn)
route.post('/sign-out', authenticate, authController.signOut)

module.exports = route;