// Импортируем пул подключений к базе данных
const pool = require('../db');

class User {
    // Статический метод для добавления нового пользователя
    static async add(name, email, role) {
        // Выполняем SQL-запрос для добавления пользователя
        const { rows } = await pool.query(
            'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *', // SQL-запрос с параметрами
            [name, email, role] // Передаем параметры в запрос
        );
        // Возвращаем добавленного пользователя
        return rows[0];
    }

    // Статический метод для получения всех пользователей
    static async getAll() {
        // Выполняем SQL-запрос для получения всех пользователей
        const { rows } = await pool.query('SELECT * FROM users');
        // Возвращаем список пользователей
        return rows;
    }

    // Статический метод для получения пользователя по ID
    static async getById(id) {
        // Выполняем SQL-запрос для получения пользователя по ID
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        // Возвращаем найденного пользователя (или undefined, если пользователь не найден)
        return rows[0];
    }

    // Статический метод для обновления пользователя
    static async update(id, name, email, role) {
        // Выполняем SQL-запрос для обновления пользователя
        const { rows } = await pool.query(
            'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING *', // SQL-запрос с параметрами
            [name, email, role, id] // Передаем параметры в запрос
        );
        // Возвращаем обновленного пользователя
        return rows[0];
    }

    // Статический метод для удаления пользователя
    static async delete(id) {
        // Выполняем SQL-запрос для удаления пользователя
        const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        // Возвращаем удаленного пользователя
        return rows[0];
    }
}

// Экспортируем класс User для использования в других частях приложения
module.exports = User;