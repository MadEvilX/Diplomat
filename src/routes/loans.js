// Импортируем Express и создаем роутер
const express = require('express');
const router = express.Router();

// Импортируем модель Loan
const Loan = require('../models/loan');

// Маршрут для выдачи книги пользователю
router.post('/', async (req, res) => {
    // Извлекаем данные из тела запроса
    const { book_id, user_id, loan_date, return_date } = req.body;

    try {
        // Пытаемся добавить новую выдачу
        const newLoan = await Loan.add(book_id, user_id, loan_date, return_date);
        // Возвращаем добавленную выдачу с статусом 201 (Created)
        newLoan.loan_date = new Date(newLoan.loan_date).toISOString().split('T')[0];
        res.status(201).json(newLoan);
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 400 и сообщение об ошибке
        res.status(400).json({ message: err.message });
    }
});

// Маршрут для получения всех выдач
router.get('/', async (req, res) => {
    try {
        // Пытаемся получить все выдачи
        const loans = await Loan.getAll();
        // Возвращаем список выдач
        res.json(loans);
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 500 и сообщение об ошибке
        res.status(500).json({ message: err.message });
    }
});

// Маршрут для получения выдачи по ID
router.get('/:id', async (req, res) => {
    // Извлекаем ID выдачи из параметров запроса
    const { id } = req.params;

    try {
        // Пытаемся получить выдачу по ID
        const loan = await Loan.getById(id);

        // Если выдача найдена, возвращаем её
        if (loan) {
            res.json(loan);
        } else {
            // Если выдача не найдена, возвращаем статус 404 и сообщение об ошибке
            res.status(404).json({ message: 'Выдача не найдена' });
        }
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 500 и сообщение об ошибке
        res.status(500).json({ message: err.message });
    }
});

// Маршрут для обновления выдачи (например, при возврате книги)
router.put('/:id', async (req, res) => {
    // Извлекаем ID выдачи из параметров запроса
    const { id } = req.params;
    // Извлекаем данные из тела запроса
    const { return_date } = req.body;

    try {
        // Пытаемся обновить выдачу
        const updatedLoan = await Loan.update(id, return_date);

        // Если выдача обновлена, возвращаем её
        if (updatedLoan) {
            res.json(updatedLoan);
        } else {
            // Если выдача не найдена, возвращаем статус 404 и сообщение об ошибке
            res.status(404).json({ message: 'Выдача не найдена' });
        }
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 500 и сообщение об ошибке
        res.status(500).json({ message: err.message });
    }
});

// Маршрут для удаления выдачи
router.delete('/:id', async (req, res) => {
    // Извлекаем ID выдачи из параметров запроса
    const { id } = req.params;

    try {
        // Пытаемся удалить выдачу
        const deletedLoan = await Loan.delete(id);

        // Если выдача удалена, возвращаем её
        if (deletedLoan) {
            res.json({ message: 'Выдача успешно удалена', loan: deletedLoan });
        } else {
            // Если выдача не найдена, возвращаем статус 404 и сообщение об ошибке
            res.status(404).json({ message: 'Выдача не найдена' });
        }
    } catch (err) {
        // Если произошла ошибка, возвращаем статус 500 и сообщение об ошибке
        res.status(500).json({ message: err.message });
    }
});

// Экспортируем роутер для использования в server.js
module.exports = router;