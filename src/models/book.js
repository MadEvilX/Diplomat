// Импортируем pool из db.js
const pool = require('../db');

// Создаем класс Book
class Book {
    // Статический метод для получения всех книг
    static async getAll() {
        // Выполняем SQL-запрос для получения всех книг
        const { rows } = await pool.query('SELECT * FROM books');
        // Возвращаем результат (массив книг)
        return rows;
    }

    // Статический метод для добавления новой книги
    static async add(title, author, year, genre) {
        // Выполняем SQL-запрос для добавления новой книги
        const { rows } = await pool.query(
            'INSERT INTO books (title, author, year, genre) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, author, year, genre]
        );
        // Возвращаем добавленную книгу
        return rows[0];
    }

    static async delete(id) {
        const { rows } = await pool.query(
            'DELETE FROM books WHERE id = $1 RETURNING *',
            [id]
        );

        return rows[0];
    }
    // Статический метод для получения книги по её ID
    static async getById(id) {
        // Выполняем SQL-запрос для получения книги с указанным ID
        const { rows } = await pool.query(
            'SELECT * FROM books WHERE id = $1', // SQL-запрос с параметром $1
            [id] // Передаем ID книги в запрос
        );
        // Возвращаем найденную книгу (или undefined, если книга не найдена)
        return rows[0];
    }
    // Обновление книги
    static async update(id, title, author, year, quantity) {
        const { rows } = await pool.query(
            `UPDATE books 
             SET title = $1, author = $2, year = $3, quantity = $4 
             WHERE id = $5 RETURNING *`,
            [title, author, year, quantity, id]
        );
        return rows[0];
    }

    // Проверка существования книги
    static async exists(id) {
        const { rows } = await pool.query(
            'SELECT EXISTS(SELECT 1 FROM books WHERE id = $1)',
            [id]
        );
        return rows[0].exists;
    }

    // Поиск книг по названию/автору
    static async search(query) {
        const { rows } = await pool.query(
            `SELECT * FROM books 
             WHERE title ILIKE $1 OR author ILIKE $1`,
            [`%${query}%`]
        );
        return rows;
    }

}


// Экспортируем класс Book
module.exports = Book;