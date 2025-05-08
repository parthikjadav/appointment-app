const expressAsyncHandler = require("express-async-handler");
const { AppError, AppResponse } = require("../utils/response");
const appointmentService = require("../services/appointment.service");

const appointmentController = {
    getAllAppointments: expressAsyncHandler(async (req, res) => {
         try {
             const appointments = await appointmentService.getAppointments(req,res);
             return new AppResponse(res,200, 'All appointments fetched successfully', appointments)                                   
         } catch (error) {
             return new AppError(res, 500, 'Failed to fetch all appointments', error.message);
         }
     }),
     createAppointment: expressAsyncHandler(async (req, res) => {
         try {
             const appointment = await appointmentService.createAppointment(req,res);
             return new AppResponse(res,200, 'Appointment created successfully', appointment)                                   
         } catch (error) {
             return new AppError(res, 500, 'Failed to create appointment', error.message);
         }
     }),
     getAllFreeSlots: expressAsyncHandler(async (req, res) => {
         try {
             const freeSlots = await appointmentService.getFreeSlots(req,res);
             return new AppResponse(res,200, 'All free slots fetched successfully', freeSlots)                                   
         } catch (error) {
             return new AppError(res, 500, 'Failed to fetch all free slots', error.message);
         }
     }),
     cancelAppointment: expressAsyncHandler(async (req, res) => {
         try {
             const appointment = await appointmentService.cancelAppointment(req,res);
             return new AppResponse(res,200, 'Appointment cancelled successfully', appointment)                                   
         } catch (error) {
             return new AppError(res, 500, 'Failed to cancel appointment', error.message);
         }
     }),
     acceptAppointment: expressAsyncHandler(async (req, res) => {
         try {
             const appointment = await appointmentService.acceptAppointment(req,res);
             return new AppResponse(res,200, 'Appointment accepted successfully', appointment)                                   
         } catch (error) {
             return new AppError(res, 500, 'Failed to accept appointment', error.message);
         }
     })
};

module.exports = appointmentController;