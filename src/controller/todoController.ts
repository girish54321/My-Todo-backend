'use strict';
import createError from 'http-errors';
import { UserToDo } from '../../models';
import { getFileExtension } from '../middlewares/fileUpload';
import fs = require('fs');

const getUserTodo = async (req, res, next) => {
    try {
        const userId = req.payLoad.aud
        const todo = await UserToDo.findAll({ where: { userId: parseInt(userId), }, });
        if (!todo) {
            res.send({ todo: [] })
            return
        }
        res.send({ todo })
    } catch (error) {
        next(error)
    }
}

const getSelectedTodo = async (req, res, next) => {
    try {
        const id = req.params.id
        const userId = req.payLoad.aud
        const todo = await UserToDo.findOne({ where: { userId: parseInt(userId), id: parseInt(id) }, });
        if (!todo) {
            res.send({ todo: [] })
            return
        }
        res.send({ todo })
    } catch (error) {
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
        next(error)
    }
}

const deleteToDo = async (req, res, next) => {
    try {
        const id = req.params.id
        if (!id) {
            throw createError.Conflict("No ToDo Found")
        }
        const userId = req.payLoad.aud;
        let imagePath = null;
        if (req.file && req.file.path) {
            imagePath = req.file.path;
        }
        const toDo = await UserToDo.findOne({ where: { id: id, userId: userId } });
        if (toDo) {
            if (toDo.todoImage) {
                if (fs.existsSync(toDo.todoImage)) {
                    fs.unlinkSync(toDo.todoImage);
                }
            }
            await toDo.destroy();
            return res.send({ deleted: true });
        } else {
            return res.send({ deleted: false });
        }
    } catch (error) {
        next(error);
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

        if (imagePath && deleteFile === "true") {
            throw createError.BadGateway("you cant upload and delete file at same time")
        }
        const toDo = await UserToDo.findOne({ where: { id: id, userId: userId } });
        if (toDo && toDo.todoImage && deleteFile === "true") {
            if (fs.existsSync(toDo.todoImage)) {
                fs.unlinkSync(toDo.todoImage);
            }
        }
        toDo.title = title;
        toDo.body = body;
        toDo.status = status;

        if (imagePath) {
            if (imagePath) {
                const newFileImage = `todoimages/${toDo.id.toString()}.${getFileExtension(imagePath)}`
                fs.rename(req?.file?.path, newFileImage, function (err) {
                    if (err) throw err;
                });
                toDo.todoImage = newFileImage
            }
        }
        if (deleteFile === "true") {
            toDo.todoImage = null;
        }
        await toDo.save();
        return res.send({ post: toDo });
    } catch (error) {
        next(error);
    }
}

export { createTdo, updateTodo, getUserTodo, deleteToDo, getSelectedTodo }