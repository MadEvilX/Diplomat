// Импортируем Express и создаем роутер
const express = require('express');
const router = express.Router();


// Импортируем модель User
const User = require('../models/user');

// Маршрут для получения всех пользователей
router.get('/', async (req, res) => {
    try {
        // Пытаемся получить всех пользователей
        const users = await User.getAll();
        // Возвращаем список пользователей
        res.json(users);
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 500 и сообщение об ошибке
        res.status(500).json({ message: err.message });
    }
});

// Маршрут для добавления нового пользователя
router.post('/', async (req, res) => {
    // Извлекаем данные из тела запроса
    const { name, email, role } = req.body;

    try {
        // Пытаемся добавить нового пользователя
        const newUser = await User.add(name, email, role);
        // Возвращаем добавленного пользователя с статусом 201 (Created)
        res.status(201).json(newUser);
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 400 и сообщение об ошибке
        res.status(400).json({ message: err.message });
    }
});

// Маршрут для получения пользователя по ID
router.get('/:id', async (req, res) => {
    // Извлекаем ID пользователя из параметров запроса
    const { id } = req.params;

    try {
        // Пытаемся получить пользователя по ID
        const user = await User.getById(id);

        // Если пользователь найден, возвращаем его
        if (user) {
            res.json(user);
        } else {
            // Если пользователь не найден, возвращаем статус 404 и сообщение об ошибке
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 500 и сообщение об ошибке
        res.status(500).json({ message: err.message });
    }
});

// Маршрут для обновления пользователя
router.put('/:id', async (req, res) => {
    // Извлекаем ID пользователя из параметров запроса
    const { id } = req.params;
    // Извлекаем данные из тела запроса
    const { name, email, role } = req.body;

    try {
        // Пытаемся обновить пользователя
        const updatedUser = await User.update(id, name, email, role);

        // Если пользователь обновлен, возвращаем его
        if (updatedUser) {
            res.json(updatedUser);
        } else {
            // Если пользователь не найден, возвращаем статус 404 и сообщение об ошибке
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 500 и сообщение об ошибке
        res.status(500).json({ message: err.message });
    }
});

// Маршрут для удаления пользователя
router.delete('/:id', async (req, res) => {
    // Извлекаем ID пользователя из параметров запроса
    const { id } = req.params;

    try {
        // Пытаемся удалить пользователя
        const deletedUser = await User.delete(id);

        // Если пользователь удален, возвращаем его
        if (deletedUser) {
            res.json({ message: 'Пользователь успешно удален', user: deletedUser });
        } else {
            // Если пользователь не найден, возвращаем статус 404 и сообщение об ошибке
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 500 и сообщение об ошибке
        res.status(500).json({ message: err.message });
    }
});

// Экспортируем роутер для использования в server.js
module.exports = router;