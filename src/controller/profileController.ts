'use strict';
import createError = require('http-errors');
import { User } from '../../models';
import fs = require('fs');

export const updateProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, email } = req.body
        const USER_ID = req.payLoad.aud
        const user = await User.findOne({ where: { id: parseInt(USER_ID) } })
        if (!user) {
            throw createError.Conflict("No User Found")
        }
        if (firstName) {
            user.firstName = firstName
        }
        if (lastName) {
            user.lastName = lastName
        }
        if (email) {
            user.email = email
        }
        await user.save()
        res.send({ user })
    } catch (error) {
        console.log("createAccount error", error);
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

export const updateImage = async (req, res, next) => {
    try {
        const USER_ID = req.payLoad.aud
        let imagePath = req?.file?.path || null
        const user = await User.findOne({ where: { id: parseInt(USER_ID) } })
        if (user?.dataValues?.profileimage) {
            if (fs.existsSync(user?.dataValues?.profileimage)) {
                fs.unlinkSync(user.dataValues.profileimage);
            }
        }
        if (!user) {
            throw createError.Conflict("No User Found")
        }
        if (imagePath) {
            user.profileimage = imagePath
        }
        await user.save()
        res.send({ user })
    } catch (error) {
        console.log("login error", error);
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

