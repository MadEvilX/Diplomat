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
        console.log('Вход для:', email);
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (!rows.length) {
            console.log('Пользователь не найден');
            throw new Error('Пользователь не найден');
        }

        const user = rows[0];
        console.log('Найден пользователь:', user.email);
        console.log('Хеш в БД:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Результат сравнения паролей:', isMatch); // Должно быть true

        if (!isMatch) throw new Error('Неверный пароль');
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