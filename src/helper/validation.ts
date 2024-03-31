import Joi from '@hapi/joi'

export const authSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    firstName: Joi.string().lowercase().min(6).required(),
    lastName: Joi.string().lowercase().min(6).required(),
    password: Joi.string().min(6).required()
})

export const loginAuthSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required()
})
