import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required(),
  role: Joi.string().valid('CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_PERSON').required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
})

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
})

export const updateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  emailVerified: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
})

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
})

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
})

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400 as number).json({ error: error.details[0].message })
    }
    next()
  }
}
