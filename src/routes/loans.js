const express = require('express');
const router = express.Router();
const Loan = require('../models/loan');
const Book = require('../models/book');
const Student = require('../models/student');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

// Выдача книги студенту
router.post('/', async (req, res) => {
    try {
        const { bookId, studentId, dueDate } = req.body;

        // Валидация типа данных
        if (typeof dueDate !== 'string') {
            return res.status(400).json({
                message: 'Due date must be a string in YYYY-MM-DD format'
            });
        }

        const loan = await Loan.create(
            parseInt(bookId),
            parseInt(studentId),
            dueDate
        );

        res.status(201).json(loan);
    } catch (err) {
        console.error('Loan creation error:', err);
        res.status(500).json({
            message: err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Возврат книги
router.post('/:id/return', authMiddleware, roleMiddleware(['admin', 'librarian']), async (req, res) => {
    try {
        const loan = await Loan.return(req.params.id);
        res.json(loan);
    } catch (err) {
        console.error('Return error:', err);
        res.status(400).json({
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Получение всех выдач
router.get('/', authMiddleware, roleMiddleware(['admin', 'librarian']), async (req, res) => {
    try {
        const loans = await Loan.getAll();
        res.json(loans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Получение выдач конкретного студента
router.get('/student/:id', async (req, res) => {
    try {
        console.log(`Fetching loans for student ${req.params.id}`);
        const loans = await Loan.getByStudent(req.params.id);

        // Всегда возвращаем успешный ответ с массивом (даже пустым)
        res.json(loans || []); // Это ключевое изменение!

    } catch (err) {
        console.error('Error fetching loans:', err);
        res.status(500).json({
            error: 'Database error',
            details: err.message
        });
    }
});
module.exports = router;