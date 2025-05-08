const expressAsyncHandler = require("express-async-handler");
const profileService = require("../services/profile.service");
const { AppError, AppResponse } = require("../utils/response");

const profileController = {
  getAllUsersProfile: expressAsyncHandler(async (req, res) => {
      try {
          const profiles = await profileService.getAllUsersProfile();
          return new AppResponse(res, 200, 'Users Profiles retrieved successfully',profiles);                                               
      } catch (error) {
          return new AppError(res, 500, 'Failed to retrieve user profiles', error.message);
      }
  }),
  createProfile: expressAsyncHandler(async (req, res) => {
      try {
          const profile = await profileService.createProfile(req,res)     
          return new AppResponse(res, 200, 'Profile created successfully',profile);
      } catch (error) {
          return new AppError(res, 500, 'Failed to create profile', error.message);
      }
  }),
  getUserProfileById: expressAsyncHandler(async (req, res) => {
      try {
         const profile = await profileService.getProfileById(req,res);
          return new AppResponse(res, 200, 'Profile retrieved successfully',profile);
      } catch (error) {
          return new AppError(res, 500, 'Failed to retrieve profile', error.message);
      }
  }),
  deleteProfile: expressAsyncHandler(async (req, res) => {
      try {
          const profile = await profileService.deleteProfile(req,res);
          return new AppResponse(res, 200, 'Profile deleted successfully',profile);
      } catch (error) {
          return new AppError(res, 500, 'Failed to delete profile', error.message);
      }
  }),
  updateProfile: expressAsyncHandler(async (req, res) => {
      try {
          const profile = await profileService.updateProfile(req,res)
          return new AppResponse(res, 200, 'Profile updated successfully',profile)                                          
      } catch (error) {
          return new AppError(res, 500, 'Failed to update profile', error.message);
      }
  })
};

module.exports = profileController;