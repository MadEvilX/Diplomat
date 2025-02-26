const express = require('express');
const router = express.Router();

// Временное хранилище книг
let books = [];

// Получить все книги
router.get('/', (req, res) => {
    res.json(books);
});

// Добавить новую книгу
router.post('/', (req, res) => {
    const { title, author, year } = req.body;
    const newBook = { id: books.length + 1, title, author, year };
    books.push(newBook);
    res.status(201).json(newBook);
});

module.exports = router;