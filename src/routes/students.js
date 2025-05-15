const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/roleMiddleware');

// Получение всех студентов
router.get('/', authMiddleware, roleMiddleware(['admin', 'librarian']), async (req, res) => {
    try {
        const students = await Student.getAll();
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Создание нового студента
router.post('/', authMiddleware, roleMiddleware(['admin', 'librarian']), async (req, res) => {
    try {
        const { firstName, lastName, groupName, email } = req.body;

        // Валидация
        if (!firstName || !lastName || !groupName || !email) {
            return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
        }

        const student = await Student.create(firstName, lastName, groupName, email);
        res.status(201).json(student);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Получение информации о студенте
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'librarian']), async (req, res) => {
    try {
        const student = await Student.getById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Студент не найден' });
        }
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удаление студента
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    try {
        await Student.delete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', authMiddleware, roleMiddleware(['admin', 'librarian']), async (req, res) => {
    try {
        const { firstName, lastName, groupName, email } = req.body;

        if (!firstName || !lastName || !groupName || !email) {
            return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
        }

        const student = await Student.update(
            req.params.id,
            firstName,
            lastName,
            groupName,
            email
        );
        res.json(student);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;