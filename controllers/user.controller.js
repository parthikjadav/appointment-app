const expressAsyncHandler = require("express-async-handler");
const userService = require("../services/user.service");
const { AppError, AppResponse } = require("../utils/response");

const userController = {
    getAllUsers: expressAsyncHandler(async (req, res) => {
        try {
            const users = await userService.getAllUsers(res);
            return new AppResponse(res, 200, 'Users retrieved successfully', users);
        } catch (error) {
            return new AppError(res, 500, 'Failed to get all users', error.message);
        }
    }),
    getUserById: expressAsyncHandler(async (req, res) => {
        try {
            const user = await userService.getUserById(req,res);

            return new AppResponse(res, 200, 'User retrieved successfully', user);
        } catch (error) {
            return new AppError(res, 500, 'Failed to get user by id', error.message);
        }
    }),
    updateUser: expressAsyncHandler(async (req, res) => {
        try {
            const user = await userService.updateUser(req,res);
            return new AppResponse(res, 200, 'User updated successfully', user);
        } catch (error) {
            return new AppError(res, 500, 'Failed to update user', error.message);
        }
    }),
    deleteUser: expressAsyncHandler(async (req, res) => {
        try {
            const user = await userService.deleteUser(req,res);
            return new AppResponse(res, 200, 'User deleted successfully', user);
        } catch (error) {
            return new AppError(res, 500, 'Failed to delete user', error.message);
        }
    })
};

module.exports = userController;