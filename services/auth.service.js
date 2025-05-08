const expressAsyncHandler = require("express-async-handler");
const { AppError, AppResponse } = require("../utils/response");
const prisma = require("../utils/prisma.util");
const { sendToken } = require("../auth");
const bcrypt = require("bcrypt");

const authService = {
    signUp: expressAsyncHandler(async (req, res) => {
        try {
            const existingUser = await prisma.user.findUnique({
                where: {
                    email: req.body.email
                }
            });
            if (existingUser) {
                return new AppError(res, 400, 'User already exists', 'Email already in use');
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            const user = await prisma.user.create({
                data: {
                    name: req.body.name,
                    email: req.body.email,
                    password: hashedPassword,
                    role: req.body.role
                }
            })         
            sendToken(res, user.id);
            return user;                                 
        } catch (error) {
            return new AppError(res, 500, 'Failed Sign Up User', error.message);
        }
    }),
    signIn: expressAsyncHandler(async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await prisma.user.findUnique({
                where: {
                    email
                }
            });
            if (!user) {
                return new AppError(res, 400, 'User not found', 'Invalid credentials');
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return new AppError(res, 400, 'Invalid credentials', 'Invalid credentials');
            }
            sendToken(res, user.id);
            return user;                                              
        } catch (error) {
            return new AppError(res, 500, 'Failed Sign In User', error.message);
        }
    })
}

module.exports = authService;