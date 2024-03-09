'use strict';
const createError = require('http-errors')
const { loginAuthSchema } = require('../helper/validation')
const { signAccessToken, signRefreshToken } = require('../helper/jwthelper')
const { User } = require('../../models')

export const getAllUser = async (req, res, next) => {
    try {
        let users;
        if (req.params.id) {
            users = await User.findOne({ where: { id: parseInt(req.params.id), }, include: 'todo' });
        } else {
            users = await User.findAll({ include: 'todo' });
        }
        if (!users) {
            throw createError.NotExtended("No Data with us")
        }
        res.send({ users })
    } catch (error) {
        console.log("getAllUser error", error);
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

export const login = async (req, res, next) => {
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
        const accessToken = await signAccessToken(USER_ID)
        const refreshToken2 = await signRefreshToken(USER_ID)
        res.send({ accessToken, refreshToken: refreshToken2 })
    } catch (error) {
        console.log("login error", error);
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}
