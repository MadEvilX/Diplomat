const express = require('express');
const router = express.Router();
const Loan = require('../models/loan');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

// Выдача книги студенту
router.post('/', authMiddleware, roleMiddleware(['admin', 'librarian']), async (req, res) => {
    try {
        const { bookId, studentId } = req.body;

        // Проверка доступности книги
        const isAvailable = await Book.isAvailable(bookId);
        if (!isAvailable) {
            return res.status(400).json({ message: 'Книга недоступна для выдачи' });
        }

        const loan = await Loan.issue(bookId, studentId);
        res.status(201).json(loan);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Возврат книги
router.post('/:id/return', authMiddleware, roleMiddleware(['admin', 'librarian']), async (req, res) => {
    try {
        await Loan.return(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ message: err.message });
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
router.get('/student/:id', authMiddleware, roleMiddleware(['admin', 'librarian']), async (req, res) => {
    try {
        const loans = await Loan.getByStudent(req.params.id);
        res.json(loans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;