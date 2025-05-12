const expressAsyncHandler = require("express-async-handler");
const serviceService = require("../services/service.service");
const { AppResponse, AppError } = require("../utils/response");

const serviceController = {
    getAllServices: expressAsyncHandler(async (req, res) => {
        try {
            const services = await serviceService.getAllUsersServices(req,res);
            return new AppResponse(res, 200, 'Services retrieved successfully', services);
        } catch (error) {
            return new AppError(res, 500, 'Failed to get all services', error.message);
        }
   }),
   getServiceById: expressAsyncHandler(async (req, res) => {
        try {
            const service = await serviceService.getServiceById(req,res);
            return new AppResponse(res, 200, 'Service retrieved successfully', service);
        } catch (error) {
            return new AppError(res, 500, 'Failed to get service', error.message);
        }
   }),
   createService: expressAsyncHandler(async (req, res) => {
        try {
            const service = await serviceService.createService(req,res);
            return new AppResponse(res, 200, 'Service created successfully', service);
        } catch (error) {
            return new AppError(res, 500, 'Failed to create service', error.message);
        }
   }),
   updateService: expressAsyncHandler(async (req, res) => {
        try {
            const service = await serviceService.updateService(req,res);
            return new AppResponse(res, 200, 'Service updated successfully', service);
        } catch (error) {
            return new AppError(res, 500, 'Failed to update service', error.message);
        }
   }),
   deleteService: expressAsyncHandler(async (req, res) => {
        try {
            const service = await serviceService.deleteService(req,res);
            return new AppResponse(res, 200, 'Service deleted successfully', service);
        } catch (error) {
            return new AppError(res, 500, 'Failed to delete service', error.message);
        }
   }),
   updateServiceTiming: expressAsyncHandler(async (req, res) => {
        try {
            const service = await serviceService.updateTiming(req,res);
            return new AppResponse(res, 200, 'Service timing updated successfully', service);
        } catch (error) {
            return new AppError(res, 500, 'Failed to update service timing', error.message);
        }
   }),
   addReview: expressAsyncHandler(async (req, res) => {
        try {
            const review = await serviceService.addReview(req,res);
            return new AppResponse(res, 200, 'Review added successfully', review);
        } catch (error) {
            return new AppError(res, 500, 'Failed to add review', error.message);
        }
   }),
   search: expressAsyncHandler(async (req, res) => {
        try {
            const services = await serviceService.search(req,res);
            return new AppResponse(res, 200, 'Services retrieved successfully', services);
        } catch (error) {
            return new AppError(res, 500, 'Failed to retrieve services', error.message);
        }
   })
};

module.exports = serviceController;