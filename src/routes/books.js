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

router.get('/:id', async (req, res) => {
    // Извлекаем id книги
    const { id } = req.params;
    try {
        // Пытаемся получить книгу с помощью метода getById
        const book = await Book.getById(id);

        // Если книга найдена, возвращаем её
        if (book) {
            res.json(book);
        } else {
            // Если книга не найдена, возвращаем статус 404 и сообщение об ошибке
            res.status(404).json({ message: 'Книга не найдена' });
        }
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 500 и сообщение об ошибке
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

router.delete('/:id', async (req, res) => {
    // Извлекаем ID книги из параметров запроса
    const { id } = req.params;
    try {
        // Пытаемся удалить книгу с помощью метода delete
        const deletedBook = await Book.delete(id);
        // Если книга удалена, возвращаем успешный ответ
        if (deletedBook) {
            res.json({ message: 'Книга успешно удалена', book: deletedBook });
        } else {
            // Если книга не найдена, возвращаем статус 404 и сообщение об ошибке
            res.status(404).json({ message: 'Книга не найдена' });
        }
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 500 и сообщение об ошибке
        res.status(500).json({ message: err.message });
    }
});
// Экспортируем роутер
module.exports = router;