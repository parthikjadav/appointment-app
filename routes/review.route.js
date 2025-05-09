const express = require('express');
const { authorize } = require('../auth');
const { USER_ROLES } = require('../constants');
const { validate, reviewSchema } = require('../validation/zod');
const reviewController = require('../controllers/review.controller');
const route = express.Router();

route.get("/", authorize([USER_ROLES.ADMIN]), reviewController.getAllReviews)
route.get("/:id", authorize([USER_ROLES.ADMIN,USER_ROLES.USER]), reviewController.getServiceReviewsById)
route.post("/",authorize([USER_ROLES.ADMIN,USER_ROLES.USER]), validate(reviewSchema.create), reviewController.addReview)
route.patch("/:id", authorize([USER_ROLES.ADMIN,USER_ROLES.USER]), validate(reviewSchema.update), reviewController.updateReview)
route.delete("/:id", authorize([USER_ROLES.ADMIN,USER_ROLES.USER]), reviewController.deleteReview)

module.exports = route;