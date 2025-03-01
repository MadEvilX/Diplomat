// Импортируем express и создаем роутер
const express = require('express');
const router = express.Router();

// Импортируем модель Book
const Book = require('../models/Book');

// Маршрут для получения всех книг
router.get('/', async (req, res) => {
    try {
        // Получаем все книги с помощью метода getAll
        const books = await Book.getAll();
        // Отправляем книги в формате JSON
        res.json(books);
    } catch (err) {
        // Если произошла ошибка, отправляем статус 500 и сообщение об ошибке
        res.status(500).json({ message: err.message });
    }
});

// Маршрут для добавления новой книги
router.post('/', async (req, res) => {
    // Извлекаем данные из тела запроса
    const { title, author, year, genre } = req.body;
    try {
        // Добавляем новую книгу с помощью метода add
        const newBook = await Book.add(title, author, year, genre);
        // Отправляем добавленную книгу в формате JSON с статусом 201 (Created)
        res.status(201).json(newBook);
    } catch (err) {
        // Если произошла ошибка, отправляем статус 400 и сообщение об ошибке
        res.status(400).json({ message: err.message });
    }
});

// Экспортируем роутер
module.exports = router;