// src/routes/auth.js
const express = require('express');
const router = express.Router();
const Auth = require('../models/Auth');
const { loginSchema } = require('../validators/userValidator');

// Маршрут для входа пользователя
router.post('/login', async (req, res) => {
    console.log('Получены данные:', req.body); // [!]
    const { error } = loginSchema.validate(req.body);
    if (error) {
        console.log('Ошибка валидации:', error.details); // [!]
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        const { token, user } = await Auth.login(req.body.email, req.body.password);
        console.log('Успешный вход:', user.email); // [!]
        res.json({ token, user });
    } catch (err) {
        console.log('Ошибка входа:', err.message); // [!]
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;