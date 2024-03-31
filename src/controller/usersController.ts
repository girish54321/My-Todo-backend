import createError from 'http-errors';
import { User } from '../../models';

export const getProfile = async (req, res, next) => {
    try {
        let users;
        const userId = req.payLoad.aud
        if (userId) {
            users = await User.findAll({ where: { id: parseInt(userId), }, include: 'todo' });
        }
        if (!users) {
            throw createError[400]("No User Found")
        }
        res.send({ users })
    } catch (error) {
        next(error)
    }
}

export const getAllUser = async (req, res, next) => {
    try {
        let users;
        if (req.params.id) {
            users = await User.findOne({ where: { id: parseInt(req.params.id), }, include: 'todo' });
        } else {
            users = await User.findAll({ include: 'todo' });
        }
        if (!users) {
            throw createError[400]("No User Found")
        }
        res.send({ users })
    } catch (error) {
        next(error)
    }
}
