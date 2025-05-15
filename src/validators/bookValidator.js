const Joi = require('joi');

const bookSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    author: Joi.string().min(3).max(50).required(),
    year: Joi.number().integer().min(1800).max(new Date().getFullYear())
        .message('"year" должен быть не больше текущего года'),
    quantity: Joi.number().integer().min(1).default(1),
    genre: Joi.string().min(2).max(30).required()
});

module.exports = {
    validateBook: (data) => bookSchema.validate(data, { abortEarly: false })
};