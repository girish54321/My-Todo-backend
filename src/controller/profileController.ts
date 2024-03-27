'use strict';
import createError = require('http-errors');
import { User, UserToDo } from '../../models';
import fs = require('fs');

export const updateProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, email, deleteImage } = req.body
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
        if (deleteImage == "true" && user.dataValues.profileimage) {
            if (fs.existsSync(user?.dataValues?.profileimage)) {
                fs.unlinkSync(user.dataValues.profileimage);
                user.profileimage = null
            }
        }
        await user.save()
        res.send({ user })
    } catch (error) {
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
        next(error)
    }
}

export const deleteProfile = async (req, res, next) => {
    try {
        const USER_ID = req.payLoad.aud
        const user = await User.findOne({ where: { id: parseInt(USER_ID) } })
        if (!user) {
            throw createError.Conflict("No User Found")
        }
        const todo = await UserToDo.findAll({ where: { userId: parseInt(USER_ID), }, });
        if (!todo) {
            throw createError.NotExtended("No Data with us")
        }
        const ogData = JSON.stringify(todo)
        const jsonData = JSON.parse(ogData)
        for (let i = 0; i < jsonData.length; i++) {
            let currentItem = jsonData[i]
            if (currentItem?.todoImage) {
                if (fs.existsSync(currentItem?.todoImage)) {
                    fs.unlinkSync(currentItem?.todoImage);
                }
            }
            const todo = await UserToDo.findOne({ where: { userId: parseInt(USER_ID), id: parseInt(currentItem?.id) }, });
            await todo.destroy();
        }
        if (user.dataValues.profileimage) {
            if (fs.existsSync(user?.dataValues?.profileimage)) {
                fs.unlinkSync(user.dataValues.profileimage);
                user.profileimage = null
            }
        }
        if (user) {
            await user.destroy();
        }
        res.send({ deleted: true });
    } catch (error) {
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}