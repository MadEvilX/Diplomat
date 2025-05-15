const pool = require('../db');

class Student {
    // Получение всех студентов
    static async getAll() {
        const { rows } = await pool.query(`
            SELECT s.*, 
                   COUNT(bl.id) FILTER (WHERE bl.status = 'issued') as active_loans
            FROM students s
            LEFT JOIN book_loans bl ON s.id = bl.student_id
            GROUP BY s.id
            ORDER BY s.last_name, s.first_name
        `);
        return rows;
    }

    // Создание студента
    static async create(firstName, lastName, groupName, email) {
        const { rows } = await pool.query(
            `INSERT INTO students 
             (first_name, last_name, group_name, email) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [firstName, lastName, groupName, email]
        );
        return rows[0];
    }

    // Получение студента по ID
    static async getById(id) {
        const { rows } = await pool.query(
            'SELECT * FROM students WHERE id = $1',
            [id]
        );
        return rows[0];
    }

    // Удаление студента
    static async delete(id) {
        const { rows } = await pool.query(
            'DELETE FROM students WHERE id = $1 RETURNING *',
            [id]
        );
        return rows[0];
    }

    // Поиск студентов
    static async search(query) {
        const { rows } = await pool.query(
            `SELECT * FROM students 
             WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1`,
            [`%${query}%`]
        );
        return rows;
    }

    // Обновление студента
    static async update(id, firstName, lastName, groupName, email) {
        const { rows } = await pool.query(
            `UPDATE students 
         SET first_name = $1, last_name = $2, group_name = $3, email = $4
         WHERE id = $5 
         RETURNING *`,
            [firstName, lastName, groupName, email, id]
        );
        return rows[0];
    }

    static async getBooks(studentId) {
        const { rows } = await pool.query(`
        SELECT bl.id, b.title as book_title, b.author as book_author, 
               bl.loan_date, bl.return_date, bl.status,
               bl.due_date
        FROM book_loans bl
        JOIN books b ON bl.book_id = b.id
        WHERE bl.student_id = $1
        ORDER BY bl.status DESC, bl.loan_date DESC
    `, [studentId]);
        return rows;
    }
}

module.exports = Student;