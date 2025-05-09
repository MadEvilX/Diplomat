const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const { checkRole } = require('../middleware/roleMiddleware');
const authMiddleware = require('../middleware/auth');
const { validateBook } = require('../validators/bookValidator');

// Применяем middleware ко всем маршрутам
router.use(authMiddleware);

// Получение всех книг (для админов и библиотекарей)
router.get('/', checkRole(['admin', 'librarian']), async (req, res) => {
    try {
        const books = await Book.getAll();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Поиск книг
router.get('/search', checkRole(['admin', 'librarian']), async (req, res) => {
    try {
        const books = await Book.search(req.query.q);
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Добавление книги (только админ)
router.post('/', checkRole(['admin']), async (req, res) => {
    try {
        const { title, author, year, quantity, genre } = req.body;
        const book = await Book.add(title, author, year, quantity, genre);
        const { error } = validateBook(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        res.status(201).json(book);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Обновление книги (только админ)
router.put('/:id', checkRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, year, quantity } = req.body;

        if (!await Book.exists(id)) {
            return res.status(404).json({ message: 'Книга не найдена' });
        }
        const { error } = validateBook(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
        const book = await Book.update(id, title, author, year, quantity);
        res.json(book);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Удаление книги (только админ)
router.delete('/:id', checkRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;

        if (!await Book.exists(id)) {
            return res.status(404).json({ message: 'Книга не найдена' });
        }

        const deletedBook = await Book.delete(id);
        res.json({ message: 'Книга удалена', book: deletedBook });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;