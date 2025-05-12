const expressAsyncHandler = require("express-async-handler");
const { AppError } = require("../utils/response");
const prisma = require("../utils/prisma.util");
const { USER_ROLES, APPOINTMENT_STATUS } = require("../constants");



const serviceService = {
    getAllUsersServices: expressAsyncHandler(async (req, res) => {
        try {
            const role = req.user.role;
            if (role === USER_ROLES.PROFESSIONAL) {
                const services = await prisma.service.findMany({
                    where: {
                        userId: req.user.id
                    },
                })
                if (services.length === 0) return new AppError(res, 404, "No services found, you have not created any service yet")
                return services;
            }
            const appointments = await prisma.appointment.groupBy({
                by: ["serviceId"],
                _count: {
                    serviceId: true
                },
                orderBy: {
                    _count: {
                        serviceId: "desc"
                    }
                }
            })

            const countMap = {}
            appointments.filter((item) => {
                countMap[item.serviceId] = item._count.serviceId
            })

            let services = await prisma.service.findMany({})
            services.sort((a, b) => {
                if (countMap[a.id] > countMap[b.id]) {
                    return -1;
                } else {
                    return 1;
                }
            })

            if (services.length === 0) return new AppError(res, 404, "No services found")
            return services;
        } catch (error) {
            return new AppError(res, 500, 'Failed to get all users', error.message);
        }
    }),
    getServiceById: expressAsyncHandler(async (req, res) => {
        try {
            const service = await prisma.service.findUnique({ where: { id: req.params.id } })
            if (!service) {
                return new AppError(res, 404, 'Service not found');
            }
            return service;
        } catch (error) {
            return new AppError(res, 500, 'Failed to get service', error.message);
        }
    }),
    createService: expressAsyncHandler(async (req, res) => {
        try {
            const { title, description, price, profileId } = req.body;
            const profile = await prisma.profile.findUnique({ where: { id: profileId } })
            if (!profile) {
                return new AppError(res, 404, 'Profile not found');
            }

            const service = await prisma.service.create({
                data: {
                    title,
                    description,
                    price,
                    userId: profile.userId,
                    profileId,
                }
            })
            return service;
        } catch (error) {
            return new AppError(res, 500, 'Failed to create service', error.message);
        }
    }),
    updateService: expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const service = await prisma.service.findUnique({ where: { id } })
            if (!service) {
                return new AppError(res, 404, 'Service not found');
            }
            if (req.user.role !== USER_ROLES.ADMIN) {
                if (service.userId !== req.user.id) {
                    return new AppError(res, 403, 'You are not authorized to update this service');
                }
            }
            const { title, description, price } = req.body;
            if (!title && !description && !price) {
                return new AppError(res, 400, 'Please provide at least one field to update');
            }
            const updatedService = await prisma.service.update({
                where: { id },
                data: {
                    title,
                    description,
                    price
                }
            })
            return updatedService;
        } catch (error) {
            return new AppError(res, 500, 'Failed to update service', error.message);
        }
    }),
    deleteService: expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const service = await prisma.service.findUnique({
                where: { id },
            });
            if (!service) {
                return new AppError(res, 404, 'Service not found');
            }
            if (req.user.role !== USER_ROLES.ADMIN) {
                if (service.userId !== req.user.id) {
                    return new AppError(res, 403, 'You are not authorized to delete this service');
                }
            }
            const deletedService = await prisma.service.delete({
                where: { id }
            });
            return deletedService;
        } catch (error) {
            return new AppError(res, 500, 'Failed to delete service', error.message);
        }
    }),
    updateTiming: expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const { timing } = req.body;

            const profile = await prisma.profile.findUnique({
                where: { id },
            });
            if (!profile) {
                return new AppError(res, 404, 'Profile not found');
            }
            if (req.user.role !== USER_ROLES.ADMIN) {
                if (profile.userId !== req.user.id) {
                    return new AppError(res, 403, 'You are not authorized to update this service')
                }
            }
            await prisma.timing.deleteMany({
                where: { profileId: id }
            });
            await prisma.timing.createMany({
                data: timing.map((t) => ({ ...t, profileId: id }))
            });
            const updateTimings = await prisma.profile.findUnique({
                where: { id },
                include: {
                    timings: true
                }
            })
            return updateTimings;
        } catch (error) {
            return new AppError(res, 500, 'Failed to update service', error.message);
        }
    }),
    search: expressAsyncHandler(async (req, res) => {
        try {
            const { search = '' } = req.query
            const services = await prisma.service.findMany({
                where: {
                    OR: [
                        {
                            title: {
                                contains: search
                            }
                        }, {
                            description: {
                                contains: search
                            }
                        }
                    ]
                }
            })

            const profiles = await prisma.profile.findMany({
                where: {
                    OR: [
                        {
                            title: {
                                contains: search
                            }
                        }, {
                            bio: {
                                contains: search
                            }
                        }
                    ]
                }
            })
            if (services.length === 0 && profiles.length === 0) return new AppError(res, 404, "No Search Results Found");
            return {
                services,
                profiles
            };
        } catch (error) {
            return new AppError(res, 500, "Internal Error In Searching Services", error.message)
        }
    })
}

module.exports = serviceService;