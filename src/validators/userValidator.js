const Joi = require('joi');

// Схема для регистрации пользователя
const registerSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('admin', 'librarian', 'student').required(),
    password: Joi.string().min(6).required(),
    group: Joi.string()
        .pattern(/^\d{2}-[А-Я]{2}-\d{3}$/) // Регулярное выражение для группы
        .required()
        .messages({
            'string.pattern.base': 'Группа должна быть в формате AA-BB-CDD',
        }),
});

// Схема для входа пользователя
const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

module.exports = { registerSchema, loginSchema };