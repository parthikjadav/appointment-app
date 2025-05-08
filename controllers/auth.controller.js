const expressAsyncHandler = require("express-async-handler");
const { AppError, AppResponse } = require("../utils/response");
const authService = require("../services/auth.service");
const prisma = require("../utils/prisma.util");

const authController = {
   signUp: expressAsyncHandler(async (req, res) => {
       try {
           const  user = await authService.signUp(req, res);
           return new AppResponse(res, 201, 'User created successfully', user);                                       
       } catch (error) {
           return new AppError(res, 500, 'Failed Sign Up User', error.message);
       }
   }),
   getUser: expressAsyncHandler(async (req, res) => {
       try {
         return new AppResponse(res, 200, 'User retrieved successfully', req.user);                                       
       } catch (error) {
           return new AppError(res, 500, '', error.message);
       }
   }),
   signIn: expressAsyncHandler(async (req, res) => {
       try {
         const user = await authService.signIn(req, res);                                 
         return new AppResponse(res, 200, 'User signed in successfully', user);
       } catch (error) {
           return new AppError(res, 500, 'Failed Sign In User', error.message);
       }
   }),
   signOut: expressAsyncHandler(async (req, res) => {
       try {
         res.clearCookie("token")
         return new AppResponse(res, 200, 'User signed out successfully');                                             
       } catch (error) {
           return new AppError(res, 500, 'Failed Sign Out', error.message);
       }
   })
};

module.exports = authController;