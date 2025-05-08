const expressAsyncHandler = require("express-async-handler");
const prisma = require("../utils/prisma.util");
const { AppError } = require("../utils/response");
const { USER_ROLES } = require("../constants");
const cache = require("../utils/lru");

const userService = {
    getAllUsers: expressAsyncHandler(async (res) => {
        try {
            if(cache.has('users')){
                return cache.get('users');
            }
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role:true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            cache.set('users', users);
            return users;
        } catch (error) {
            throw new AppError(500, 'Failed to retrieve users', error.message);
        }
    }),
    getUserById: expressAsyncHandler(async (req,res) => {
        try {
            const { id } = req.params; // Get the user ID from the request parameters
            if (!id) {
                return new AppError(res, 400, 'Invalid input', 'User ID is required');
            }
            if(cache.has(`user-${id}`)){
                return cache.get(`user-${id}`);
            }
            const user = await prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            if (!user) {
                return new AppError(res, 404, 'User not found', 'User not found');
            }
            cache.set(`user-${id}`, user);
            return user;
        } catch (error) {
            return new AppError(res, 500, 'Failed to retrieve user', error.message);
        }
    }),
    updateUser: expressAsyncHandler(async (req, res) => {
        try {
            if(req.user.role !== USER_ROLES.ADMIN){
                if(req.user.id !== req.params.id){
                    return new AppError(res, 403, 'Forbidden', 'You are not authorized to update this user');
                }
            }
            const { id } = req.params; // Get the user ID from the request parameters
            const { name,password, role } = req.body; // Get the updated user data from the request body
            if (!name && !password && !role) {
                return new AppError(res, 400, 'Invalid input', 'Name, password and role one of the field is required');
            }
            let hashedPassword;
            if(password){
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(password, salt);
            }
            const user = await prisma.user.update({
                where: { id },
                data: {
                    name,
                    password: password ? hashedPassword : undefined, // Only update password if provided
                    role
                }
            });
            if(!user){
                return new AppError(res, 404, 'Not Found');
            }
            cache.set(`user-${id}`, user); // Update the cache with the new user data
            cache.delete('users'); // Delete the users cache to ensure fresh data
            return user;
        } catch (error) {
            return new AppError(res, 500, 'Failed to update user', error.message);
        }
    }),
    deleteUser: expressAsyncHandler(async (req,res) => {
        try {
            const { id } = req.params; // Get the user ID from the request parameters
            if (!id) {
                return new AppError(res, 400, 'Invalid input', 'User ID is required');
            }
            if(req.user.role !== USER_ROLES.ADMIN){
                if(req.user.id !== id){
                    return new AppError(res, 403, 'Forbidden', 'You are not authorized to delete this user');
                }
            }
            const user = await prisma.user.delete({
                where: { id }
            });
            if(!user){
                return new AppError(res, 404, 'Not Found');
            }
            cache.delete(`user-${id}`); // Delete the user from the cache
            cache.delete('users'); // Delete the users cache to ensure fresh data
            return user;
        } catch (error) {
            return new AppError(res, 500, 'Failed to delete user', error.message);
        }
    })
};

module.exports = userService;
