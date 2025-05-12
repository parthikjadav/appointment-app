const expressAsyncHandler = require("express-async-handler");
const { AppError, AppResponse } = require("../utils/response");
const chatService = require("../services/chat.service");
const { cleanGeminiText } = require("../utils/reusable");

const chatController = {
    askAboutService: expressAsyncHandler(async(req,res)=>{
        try {
            const response = await chatService.getServiceDetails(req,res);
            const cleanResponse = cleanGeminiText(response)
            return new AppResponse(res,200,"Success fully Get response",cleanResponse);
        } catch (error) {
            console.log(error.message);
            return new AppError(res,450, "Failed to chat with Ai", error.message)
        }
    })
};

module.exports = chatController;