'use strict';
import createError = require('http-errors');
import { loginAuthSchema } from '../helper/validation';
import { signAccessToken, signRefreshToken, isValidPassword } from '../helper/jwthelper';
import { User, UserToDo } from '../../models';
import { getFileExtension } from '../middlewares/fileUpload';
import fs = require('fs');

const getUserTodo = async (req, res, next) => {
    try {
        const userId = req.payLoad.aud
        const todo = await UserToDo.findAll({ where: { userId: parseInt(userId), }, });
        if (!todo) {
            throw createError.NotExtended("No Data with us")
        }
        res.send({ todo })
    } catch (error) {
        console.log("getAllUser error", error);
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

const createTdo = async (req, res, next) => {
    try {
        const { title, body } = req.body
        let imagePath = req?.file?.path || null
        const userId = req.payLoad.aud
        const data = await UserToDo.create({ title, body, status: "OPEN", todoImage: imagePath ?? null, userId: parseInt(userId) })
        if (imagePath) {
            const newFileImage = `todoimages/${data.dataValues.id.toString()}.${getFileExtension(imagePath)}`
            fs.rename(req?.file?.path, newFileImage, function (err) {
                if (err) throw err;
            });
            data.todoImage = newFileImage
            data.save()
        }
        return res.send({ post: data })
    } catch (error) {
        console.log("Create Todo Error", error);
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

const updateTodo = async (req, res, next) => {
    try {
        const { title, body, id, status, deleteFile } = req.body;
        const userId = req.payLoad.aud;
        let imagePath = null;
        if (req.file && req.file.path) {
            imagePath = req.file.path;
        }

        if (imagePath && deleteFile) {
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            throw createError.BadGateway("you cant upload and delete file at same time")
        }
        const toDo = await UserToDo.findOne({ where: { id: id, userId: userId } });
        if ((toDo && toDo.todoImage && imagePath) || (deleteFile && toDo.todoImage)) {
            if (imagePath && deleteFile) {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }
        toDo.title = title;
        toDo.body = body;
        toDo.status = status;
        if (imagePath) {
            toDo.todoImage = imagePath;
        }
        if (deleteFile) {
            toDo.todoImage = null;
        }
        await toDo.save();
        return res.send({ toDo });
    } catch (error) {
        console.log("Update Todo Error", error);
        if (error.isJoi === true) {
            error.status = 422;
        }
        next(error);
    }
}


const login = async (req, res, next) => {
    try {
        const result = await loginAuthSchema.validateAsync(req.body)
        const user = await User.findOne({ where: { email: result.email } });
        if (!user) {
            throw createError.Conflict("No User Found")
        }
        const PASSWORD = user.dataValues.password.toString()
        if (!PASSWORD) {
            throw createError.Conflict("No Pass")
        }
        const USER_ID = user.dataValues.id.toString()
        const isMatch = await isValidPassword(PASSWORD, result.password)
        if (!isMatch) {
            throw createError.BadGateway("No Pass Bro")
        }
        const accessToken = await signAccessToken(USER_ID)
        const refreshToken2 = await signRefreshToken(USER_ID)
        res.send({ accessToken, refreshToken: refreshToken2 })
    } catch (error) {
        console.log("login Error", error);
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

export { createTdo, login, updateTodo, getUserTodo }