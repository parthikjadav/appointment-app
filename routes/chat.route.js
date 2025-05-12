const express = require('express');
const chatController = require('../controllers/chat.controller');
const { validate, chatSchema } = require('../validation/zod');
const route = express.Router();

route.post('/',validate(chatSchema.create),chatController.askAboutService)

module.exports = route;