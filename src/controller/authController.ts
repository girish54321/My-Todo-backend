import createError = require('http-errors')
import { authSchema, loginAuthSchema } from '../helper/validation'
import { signAccessToken, signRefreshToken, hashPassword, isValidPassword } from '../helper/jwthelper'
import { User } from '../../models'

const createAccount = async (req, res, next) => {
    try {
        const result = await authSchema.validateAsync(req.body)
        const diesExist = await User.findOne({ where: { email: result.email } });
        if (diesExist) {
            throw createError.Conflict("Use other email")
        }
        const createdUser = await User.create(result)
        const USER_ID = createdUser.dataValues.id.toString()
        const accessToken = await signAccessToken(USER_ID)
        const refreshToken = await signRefreshToken(USER_ID)
        const password = await hashPassword(result.password)
        const user = await User.findOne({ where: { id: USER_ID } })
        if (!password) {
            throw createError.Conflict("Server Error!")
        }
        user.password = password
        await user.save()
        res.send({ accessToken, refreshToken })
    } catch (error) {
        console.log("createAccount error", error);
        if (error.isJoi === true) error.status = 422
        next(error)
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
        const accessToken = await signAccessToken(USER_ID)
        const refreshToken2 = await signRefreshToken(USER_ID)
        res.send({ accessToken, refreshToken: refreshToken2 })
    } catch (error) {
        console.log("login error", error);
        if (error.isJoi === true) error.status = 422
        next(error)
    }
}

export { createAccount, login }