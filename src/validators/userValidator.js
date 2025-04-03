// src/validators/userValidator.js
const Joi = require('joi');

// Схема для входа пользователя
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

module.exports = { loginSchema };