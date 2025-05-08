const prisma = require("../utils/prisma.util");
const { AppError } = require("../utils/response");
const jwt = require("jsonwebtoken");


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return null;
            }
            return decoded;
        });
    } catch (error) {
        return null;
    }
}

const authenticate = async (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return new AppError(res, 401, 'Unauthorized', 'No token provided');
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        return new AppError(res, 401, 'Unauthorized', 'Invalid token');
    }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    delete user.password; // Remove password from user object
    if (!user) {
        return new AppError(res, 401, 'Unauthorized', 'User not found');
    }
    req.user = user;
    next();
}

const authorize = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return new AppError(res, 403, 'Forbidden', 'You are not authorized to access this resource');
    }
    next();
}

const sendToken = (res, id) => {
    const token = createToken(id)
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
}

module.exports = {
    createToken,
    verifyToken,
    authenticate,
    authorize,
    sendToken
}