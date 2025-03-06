const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    logger.error(`Ошибка: ${err.message}`);

    // Определяем статус ошибки
    const status = err.status || 500;

    // Возвращаем JSON с сообщением об ошибке
    res.status(status).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;