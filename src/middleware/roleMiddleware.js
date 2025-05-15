module.exports = (allowedRoles) => (req, res, next) => {
    console.log('Текущая роль:', req.user?.role, 'Разрешённые:', allowedRoles);

    if (!req.user || !allowedRoles.includes(req.user.role)) {
        console.log('Отказано в доступе для роли:', req.user?.role);
        return res.status(403).json({ message: 'Доступ запрещён' });
    }
    next();
};

