const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const roleMiddleware = require('../middleware/roleMiddleware');
const authMiddleware = require('../middleware/auth');
const { validateBook } = require('../validators/bookValidator');

// Применяем middleware ко всем маршрутам
router.use(authMiddleware);

// Получение всех книг (для админов и библиотекарей)
router.get('/', authMiddleware, roleMiddleware(['admin', 'librarian']), async (req, res) => {
    try {
        const books = await Book.getAll();
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Поиск книг
router.get('/search', roleMiddleware(['admin', 'librarian']), async (req, res) => {
    try {
        const books = await Book.search(req.query.q);
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Добавление книги (только админ)
router.post('/', roleMiddleware(['admin']), async (req, res) => {
    try {
        // Сначала валидация
        const { error } = validateBook(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // Затем извлечение данных
        const { title, author, year, quantity, genre } = req.body;

        // Проверка обязательных полей
        if (!genre) {
            return res.status(400).json({ message: 'Поле "genre" обязательно для заполнения' });
        }

        // И только потом сохранение
        const book = await Book.add(title, author, year, quantity, genre);
        res.status(201).json(book);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Удаление книги
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        await Book.delete(id);
        res.json({ success: true, message: 'Книга удалена' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Получение доступных книг
router.get('/available', authMiddleware, roleMiddleware(['admin', 'librarian']), async (req, res) => {
    try {
        const books = await Book.getAvailable();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Редактирование книги
router.put('/:id', roleMiddleware(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = validateBook(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { title, author, year, quantity, genre } = req.body;
        const updatedBook = await Book.update(id, title, author, year, quantity, genre);

        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;