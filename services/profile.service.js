const expressAsyncHandler = require("express-async-handler");
const prisma = require("../utils/prisma.util");
const { AppError } = require("../utils/response");
const { USER_ROLES } = require("../constants");
const cache = require("../utils/lru");

const profileService = {
    getAllUsersProfile: expressAsyncHandler(async (req, res) => {
        try {
            if (cache.has('profiles')) {
                return cache.get('profiles');
            }
            const profiles = await prisma.profile.findMany()
            cache.set('profiles', profiles)
            return profiles;
        } catch (error) {
            return new AppError(res, 500, 'Failed to get all users profile', error.message);
        }
    }),
    createProfile: expressAsyncHandler(async (req, res) => {
        try {
            const userId = req.user.id;
            const { title, bio, timing } = req.body;
            const isAlreadyCreated = await prisma.profile.findUnique({
                where: {
                    userId
                }
            });
            console.log(isAlreadyCreated);

            if (isAlreadyCreated) {
                return new AppError(res, 400, 'Profile already exists', 'Profile already exists');
            }
            const profile = await prisma.profile.create({
                data: {
                    userId,
                    title,
                    bio,
                    timings: {
                        create: timing
                    }
                },
                include:{
                    timings:true
                }
            })
            cache.delete('profiles')
            return profile;
        } catch (error) {
            return new AppError(res, 500, 'Failed to create profile', error.message);
        }
    }),
    getProfileById: expressAsyncHandler(async (req, res) => {
        try {
            const { id } = req.params
            if (cache.has(`profile-${id}`)) {
                return cache.get(`profile-${id}`);
            }
            const profile = await prisma.profile.findUnique({ where: { id } })
            if (!profile) {
                return new AppError(res, 404, 'Profile not found');
            }
            cache.set(`profile-${id}`, profile)
            return profile;
        } catch (error) {
            return new AppError(res, 500, 'Failed to get profile by id', error.message);
        }
    }),
    deleteProfile: expressAsyncHandler(async (req, res) => {
        try {
            const isProfileExist = await prisma.profile.findUnique({ where: { id: req.params.id } })
            if (!isProfileExist) {
                return new AppError(res, 404, 'Profile not found');
            }

            if (req.user.role !== USER_ROLES.ADMIN) {
                if (req.user.id !== isProfileExist.userId) {
                    return new AppError(res, 403, 'You are not authorized to delete this profile');
                }
            }
            const profile = await prisma.profile.delete({ where: { id: req.params.id } })
            cache.delete(`profile-${req.params.id}`)
            cache.delete("profiles")
            return profile;
        } catch (error) {
            console.log(error);

            return new AppError(res, 500, 'Failed to delete profile', error.message);
        }
    }),
    updateProfile: expressAsyncHandler(async (req, res) => {
        try {
            if (req.user.role !== USER_ROLES.ADMIN) {
                if (req.user.id !== req.params.id) {
                    return new AppError(res, 403, 'You are not authorized to update this profile');
                }
            }
            const { title, bio } = req.body;
            if (!title && !bio) {
                return new AppError(res, 400, 'Please provide at least one field to update');
            }
            const profile = await prisma.profile.update({
                where: { id: req.params.id },
                data: {
                    title,
                    bio
                }
            })
            if (!profile) {
                return new AppError(res, 404, 'Profile not found');
            }
            cache.delete(`profile-${req.params.id}`)
            cache.delete("profiles")
            return profile;
        } catch (error) {
            return new AppError(res, 500, 'Failed to update profile', error.message);
        }
    })
}

module.exports = profileService