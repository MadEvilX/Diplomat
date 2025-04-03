const express = require('express');
const router = express.Router();
const checkRole = require('../middleware/roleMiddleware');

// Только для админов
router.get('/dashboard', checkRole('admin'), (req, res) => {
    res.json({ message: 'Панель администратора' });
});

module.exports = router;