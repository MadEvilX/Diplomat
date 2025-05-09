const Joi = require('joi');

const bookSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    author: Joi.string().min(3).max(50).required(),
    year: Joi.number().integer().min(1800).max(new Date().getFullYear()),
    quantity: Joi.number().integer().min(1).default(1)
});

module.exports = {
    validateBook: (data) => bookSchema.validate(data)
};