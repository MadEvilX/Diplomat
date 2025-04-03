const roleMiddleware = (allowedRoles) => (req, res, next) => {
    const userRole = req.user.role; // Роль пользователя из JWT-токена

    // Проверяем, есть ли роль пользователя в списке разрешенных ролей
    if (allowedRoles.includes(userRole)) {
        next(); // Продолжаем выполнение запроса
    } else {
        res.status(403).json({ message: 'Доступ запрещен' }); // Возвращаем ошибку 403
    }
};

module.exports = roleMiddleware;

module.exports = (requiredRole) => (req, res, next) => {
    const user = req.user; // Получаем из JWT-токена

    if (user.role !== requiredRole) {
        return res.status(403).json({ message: 'Доступ запрещён' });
    }
    next();
};