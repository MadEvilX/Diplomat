const jwt = require('jsonwebtoken');

// Middleware для проверки JWT-токена
const authMiddleware = (req, res, next) => {
    // Извлекаем токен из заголовка Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Если токен отсутствует, возвращаем ошибку
    if (!token) {
        return res.status(401).json({ message: 'Доступ запрещен. Токен отсутствует.' });
    }

    try {
        // Проверяем токен
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET // И здесь!
        );
        // Добавляем информацию о пользователе в объект запроса
        req.user = decoded;
        next();
    } catch (err) {
        // Если токен недействителен, возвращаем ошибку
        res.status(400).json({ message: 'Недействительный токен.' });
    }
};

module.exports = authMiddleware;