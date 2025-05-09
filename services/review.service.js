const expressAsyncHandler = require("express-async-handler");
const prisma = require("../utils/prisma.util");
const { AppError } = require("../utils/response");
const { APPOINTMENT_STATUS, USER_ROLES } = require("../constants");

const reviewService = {
    addReview: expressAsyncHandler(async (req, res) => {
        try {
            const { appointmentId, rating, comment } = req.body;
            const { id } = req.user;
            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
                include: {
                    service: true,
                    user: true
                }
            });
            if (!appointment) {
                return new AppError(res, 404, 'Appointment not found');
            }

            if (!appointment.isPaid || appointment.isRefunded || appointment.status !== APPOINTMENT_STATUS.COMPLETED) {
                return new AppError(res, 404, 'You can not review this Appointment');
            }

            const { id: serviceId } = appointment.service;

            const review = await prisma.review.create({
                data: {
                    serviceId,
                    userId: id,
                    rating,
                    comment
                }
            })

            return review;
        } catch (error) {
            return new AppError(res, 500, 'Failed to add review', error.message);
        }
    }),
    updateReview: expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const { id: userId, role } = req.user;
            const { rating, comment } = req.body;

            if (!rating && !comment || id) {
                return new AppError(res, 400, 'Please provide required fields');
            }

            const review = await prisma.review.findUnique({
                where: {
                    id
                }
            })

            if (!review) {
                return new AppError(res, 404, 'Review not found');
            }

            if (role !== USER_ROLES.ADMIN && userId !== review.userId) {
                return new AppError(res, 403, 'You are not authorized to update this review');
            }

            const updatedReview = await prisma.review.update({
                where: {
                    id
                },
                data: {
                    rating,
                    comment
                }
            })

            return updatedReview;
        } catch (error) {
            return new AppError(res, 500, 'Failed to update review', error.message);
        }
    }),
    deleteReview: expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const { id: userId, role } = req.user;
            if (!id) {
                return new AppError(res, 400, 'Review id is required');
            }
            const review = await prisma.review.findUnique({
                where: {
                    id
                }
            })

            if (!review) {
                return new AppError(res, 404, 'Review not found');
            }

            if (role !== USER_ROLES.ADMIN && review.userId !== userId) {
                return new AppError(res, 403, 'You are not authorized to delete this review');
            }

            const deletedReview = await prisma.review.delete({
                where: {
                    id
                }
            })

            return deletedReview;
        } catch (error) {
            return new AppError(res, 500, 'Failed to delete review', error.message);
        }
    }),
    getServiceReviewsById: expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return new AppError(res, 400, 'Service id is required');
            }
            const service = await prisma.service.findUnique({
                where: {
                    id
                },
                include: {
                    reviews: true
                }
            })

            if (!service || service.reviews.length === 0) {
                return new AppError(res, 404, 'Service or Reviews not found');
            }

            return service.reviews;
        } catch (error) {
            return new AppError(res, 500, 'Failed to get reviews', error.message);
        }
    })
}

module.exports = reviewService;