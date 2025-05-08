const { z } = require("zod");
const { USER_ROLES } = require("../constants");
const { AppError } = require("../utils/response");

const validator = {
    validate: (schema) => (req, res, next) => {
        const data = schema.safeParse(req.body);
        if (!data.success) {
            return new AppError(res, 422, 'Validation Error', data.error.format());
        }
        next(); // Call next() if validation is successful
    },
    validateParams: (schema) => (req, res, next) => {
        const data = schema.safeParse(req.params);
        if (!data.success) {
            return new AppError(res, 422, 'Validation Error', data.error.format());
        }
        next(); // Call next() if validation is successful
    },
    userSchema: {
        create: z.object({
            name: z.string().min(1, { message: "Name is required" }),
            email: z.string().email({ message: "Invalid email address" }),
            password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
            role: z.enum([USER_ROLES.USER, USER_ROLES.PROFESSIONAL, USER_ROLES.ADMIN], { message: "Role must be either 'USER', 'PROFESSIONAL' or 'ADMIN'" }).optional()
        }),
        update: z.object({
            name: z.string().optional(),
            password: z.string().optional(),
            role: z.enum([USER_ROLES.USER, USER_ROLES.PROFESSIONAL, USER_ROLES.ADMIN], { message: "Role must be either 'USER', 'PROFESSIONAL' or 'ADMIN'" }).optional()
        }),
        signIn: z.object({
            email: z.string().email({ message: "Invalid email address" }),
            password: z.string().min(6, { message: "Password must be at least 6 characters long" })
        })
    },
    profileSchema: {
        create: z.object({
            bio: z.string().min(3, { message: "Bio must be at least 3 characters long" }).optional(),
            title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
            timing: z.array(z.object({
                day: z.number(),
                startTime: z.string().datetime().min(1, { message: "Start time must be at least 1 character long" }),
                endTime: z.string().datetime().min(1, { message: "End time must be at least 1 character long" })
            }))
        }),
        update: z.object({
            bio: z.string().min(3, { message: "Bio must be at least 3 characters long" }).optional(),
            title: z.string().min(3, { message: "Title must be at least 3 characters long" }).optional(),
        })
    },
    paramIdSchema: z.object({
        id: z.string().min(10, { message: "Invalid ID" })
    }),
    serviceSchema: {
        create: z.object({
            profileId: z.string().min(1, { message: "Invalid profile ID" }),
            title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
            description: z.string().min(3, { message: "Description must be at least 3 characters long" }),
            price: z.number().min(1, { message: "Price must be at least 1" }),
        }),
        update: z.object({
            title: z.string().min(3, { message: "Title must be at least 3 characters long" }).optional(),
            description: z.string().min(3, { message: "Description must be at least 3 characters long" }).optional(),
            price: z.number().min(1, { message: "Price must be at least 1" }).optional(),
        }),
        updateTiming: z.object({
            timing: z.array(z.object({
                day: z.number(),
                startTime: z.string().datetime().min(1, { message: "Start time must be at least 1 character long" }),
                endTime: z.string().datetime().min(1, { message: "End time must be at least 1 character long" })
            }))
        })
    },
    appointmentSchema: {
        create:  z.object({
            userId: z.string().min(1, { message: "User id must be at least 1" }),
            serviceId: z.string().min(1, { message: "Service id must be at least 1" }),
            professionalId: z.string().min(1, { message: "Professional id must be at least 1" }),
            from: z.string().datetime().min(1, { message: "From must be at least 1 character long" }),
            to: z.string().datetime().min(1, { message: "To must be at least 1 character long" }),
        }),
        slots: z.object({
            date: z.string().date().min(1, { message: "Date must be at least 1 character long" }),
            professionalId: z.string().min(1, { message: "Service id must be at least 1" }),
        }),
    }
}

module.exports = validator;