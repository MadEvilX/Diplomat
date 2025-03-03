// Импортируем пул подключений к базе данных
const pool = require('../db');

class Loan {
    // Статический метод для выдачи книги пользователю
    static async add(book_id, user_id, loan_date, return_date = null) {
        // Выполняем SQL-запрос для добавления выдачи
        const { rows } = await pool.query(
            'INSERT INTO loans (book_id, user_id, loan_date, return_date) VALUES ($1, $2, $3, $4) RETURNING *', // SQL-запрос с параметрами
            [book_id, user_id, loan_date, return_date] // Передаем параметры в запрос
        );
        // Возвращаем добавленную выдачу
        return rows[0];
    }
    // Статический метод для получения всех выдач
    static async getAll() {
        // Выполняем SQL-запрос для получения всех выдач
        const { rows } = await pool.query('SELECT * FROM loans');
        // Преобразуем loan_date и return_date в формат YYYY-MM-DD
        const formattedLoans = rows.map(loan => ({
            ...loan,
            loan_date: new Date(loan.loan_date).toISOString().split('T')[0],
            return_date: loan.return_date ? new Date(loan.return_date).toISOString().split('T')[0] : null
        }));
        // Возвращаем список выдач с отформатированными датами
        return formattedLoans;
    }

    // Статический метод для получения выдачи по ID
    static async getById(id) {
        // Выполняем SQL-запрос для получения выдачи по ID
        const { rows } = await pool.query('SELECT * FROM loans WHERE id = $1', [id]);
        // Возвращаем найденную выдачу (или undefined, если выдача не найдена)
        return rows[0];
    }

    // Статический метод для обновления выдачи (например, при возврате книги)
    static async update(id, return_date) {
        // Выполняем SQL-запрос для обновления выдачи
        const { rows } = await pool.query(
            'UPDATE loans SET return_date = $1 WHERE id = $2 RETURNING *', // SQL-запрос с параметрами
            [return_date, id] // Передаем параметры в запрос
        );
        // Возвращаем обновленную выдачу
        return rows[0];
    }

    // Статический метод для удаления выдачи
    static async delete(id) {
        // Выполняем SQL-запрос для удаления выдачи
        const { rows } = await pool.query('DELETE FROM loans WHERE id = $1 RETURNING *', [id]);
        // Возвращаем удаленную выдачу
        return rows[0];
    }
}

// Экспортируем класс Loan для использования в других частях приложения
module.exports = Loan;