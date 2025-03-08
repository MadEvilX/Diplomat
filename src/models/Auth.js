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
        // Выполняем SQL-запрос для получения пользователя по email
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        // Если пользователь не найден, выбрасываем ошибку
        if (rows.length === 0) {
            throw new Error('Пользователь не найден');
        }

        // Сравниваем введенный пароль с хешированным паролем в базе данных
        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // Если пароль неверный, выбрасываем ошибку
        if (!isPasswordValid) {
            throw new Error('Неверный пароль');
        }
        // Создаем JWT-токен
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, // Полезная нагрузка токена
            'your-secret-key', // Секретный ключ (замените на что-то более безопасное)
            { expiresIn: '1h' } // Время жизни токена
        );

        return { token, user };// Возвращаем токен и информацию о пользователе
    }
}

module.exports = Auth;// Экспортируем класс Auth для использования в других частях приложения