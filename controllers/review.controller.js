const expressAsyncHandler = require("express-async-handler");
const { AppError, AppResponse } = require("../utils/response");
const reviewService = require("../services/review.service");
const prisma = require("../utils/prisma.util");

const reviewController = {
  addReview: expressAsyncHandler(async (req, res) => {
      try {
        const review = await reviewService.addReview(req,res)

        return new AppResponse(res, 200, "Review added successfully", review);
      } catch (error) {
        return new AppError(res,500, "Failed to add review", error.message)
      }
  }),
  updateReview: expressAsyncHandler(async (req, res) => {
      try {
        const review = await reviewService.updateReview(req,res)

        return new AppResponse(res, 200, "Review updated successfully", review);
      } catch (error) {
        return new AppError(res,500, "Failed to update review", error.message)
      }
  }),
  deleteReview: expressAsyncHandler(async (req, res) => {
      try {
        const review = await reviewService.deleteReview(req,res)

        return new AppResponse(res, 200, "Review deleted successfully", review);
      } catch (error) {
        return new AppError(res,500, "Failed to delete review", error.message)
      }
  }),
  getServiceReviewsById: expressAsyncHandler(async (req, res) => {
      try {
        const reviews = await reviewService.getServiceReviewsById(req,res)

        return new AppResponse(res, 200, "Reviews retrieved successfully", reviews);
      } catch (error) {
        return new AppError(res,500, "Failed to retrieve reviews", error.message)
      }
  }),
  getAllReviews: expressAsyncHandler(async (req, res) => {
      try {
          const reviews = await prisma.review.findMany({
              include: {
                  service: true,
                  user: true,
              },
          })    
          return new AppResponse(res, 200, 'Reviews retrieved successfully', reviews);
      } catch (error) {
          return new AppError(res, 500, 'Failed to get all reviews', error.message);
      }
  })
};

module.exports = reviewController;