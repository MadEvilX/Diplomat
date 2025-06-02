module.exports = (allowedRoles) => (req, res, next) => {
    console.log('Текущая роль:', req.user?.role, 'Разрешённые:', allowedRoles);

    // Приводим роли к нижнему регистру для сравнения
    const userRole = req.user?.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

    if (!req.user || !normalizedAllowedRoles.includes(userRole)) {
        console.log('Отказано в доступе для роли:', req.user?.role);
        return res.status(403).json({ message: 'Доступ запрещён' });
    }
    next();
};
