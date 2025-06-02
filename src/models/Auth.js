const pool = require('../db');// Импортируем пул подключений к базе данных
const bcrypt = require('bcryptjs');// Импортируем библиотеку для хеширования паролей
const jwt = require('jsonwebtoken');// Импортируем библиотеку для создания JWT-токенов

class Auth {
    // Статический метод для регистрации нового пользователя
    static async register(name, email, role, password) {
        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10); // 10 — это salt rounds

        // Выполняем SQL-запрос для добавления пользователя
        const { rows } = await pool.query(
            'INSERT INTO users (name, email, role, password) VALUES ($1, $2, $3, $4) RETURNING *', // SQL-запрос с параметрами
            [name, email, role, hashedPassword] // Передаем параметры в запрос
        );
        // Возвращаем добавленного пользователя
        return rows[0];
    }

    // Статический метод для входа пользователя
    static async login(email, password) {
        // 1. Проверка пользователя
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (!rows.length) throw new Error('Пользователь не найден');

        const user = rows[0];

        // 2. Проверка пароля
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Неверный пароль');

        // 3. Генерация токена
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET не настроен!');
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role.toLowerCase() // Приводим роль к нижнему регистру
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('[DEBUG] Токен сгенерирован:', token); // Логирование

        // 4. Формируем ответ
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        };
    }

    static async updatePassword(email, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2',
            [hashedPassword, email]
        );
    }
}

module.exports = Auth;// Экспортируем класс Auth для использования в других частях приложения