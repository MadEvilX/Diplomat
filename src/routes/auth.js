// Импортируем Express и создаем роутер
const express = require('express');
const router = express.Router();

// Импортируем модель Auth
const Auth = require('../models/auth');

// Маршрут для регистрации нового пользователя
router.post('/register', async (req, res) => {
    // Извлекаем данные из тела запроса
    const { name, email, role, password } = req.body;

    try {
        // Пытаемся зарегистрировать нового пользователя
        const newUser = await Auth.register(name, email, role, password);
        // Возвращаем добавленного пользователя с статусом 201 (Created)
        res.status(201).json(newUser);
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 400 и сообщение об ошибке
        res.status(400).json({ message: err.message });
    }
});

// Маршрут для входа пользователя
router.post('/login', async (req, res) => {
    // Извлекаем данные из тела запроса
    const { email, password } = req.body;

    try {
        // Пытаемся войти пользователя
        const { token, user } = await Auth.login(email, password);
        // Возвращаем токен и информацию о пользователе
        res.json({ token, user });
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 400 и сообщение об ошибке
        res.status(400).json({ message: err.message });
    }
});

const { registerSchema, loginSchema } = require('../validators/userValidator');

// Маршрут для регистрации нового пользователя
router.post('/register', async (req, res) => {
    // Валидируем данные
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, role, password } = req.body;

    try {
        const newUser = await Auth.register(name, email, role, password);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

const logger = require('../utils/logger');

router.post('/register', async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        logger.error(`Ошибка валидации: ${error.details[0].message}`);
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, role, password } = req.body;

    try {
        const newUser = await Auth.register(name, email, role, password);
        logger.info(`Пользователь зарегистрирован: ${email}`);
        res.status(201).json(newUser);
    } catch (err) {
        logger.error(`Ошибка при регистрации: ${err.message}`);
        res.status(400).json({ message: err.message });
    }
});

// Экспортируем роутер для использования в server.js
module.exports = router;