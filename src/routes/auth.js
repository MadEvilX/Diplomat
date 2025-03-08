// src/routes/auth.js
const express = require('express');
const router = express.Router();
const Auth = require('../models/Auth');
const { registerSchema, loginSchema } = require('../validators/userValidator');

// Маршрут для регистрации нового пользователя
router.post('/register', async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, role, password, group } = req.body;

    try {
        const newUser = await Auth.register(name, email, role, password, group);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Маршрут для входа пользователя
router.post('/login', async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;

    try {
        const { token, user } = await Auth.login(email, password);
        res.json({ token, user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;