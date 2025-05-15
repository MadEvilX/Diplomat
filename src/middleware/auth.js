const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Получаем токен из заголовка
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // 2. Проверка наличия токена
    if (!token) {
        return res.status(401).json({ message: 'Токен отсутствует' });
    }

    // 3. Верификация токена
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Успешная верификация токена для пользователя:', {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        });
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Ошибка верификации токена:', err.message);
        return res.status(401).json({ message: 'Недействительный токен' });
    }
};