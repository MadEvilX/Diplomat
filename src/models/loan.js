// Импортируем пул подключений к базе данных
const pool = require('../db');

class Loan {
    // Выдача книги с уменьшением количества
    static async issue(bookId, studentId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Уменьшаем количество книг
            await client.query(
                'UPDATE books SET quantity = quantity - 1 WHERE id = $1 AND quantity > 0',
                [bookId]
            );

            // Создаем запись о выдаче
            const { rows } = await client.query(
                `INSERT INTO book_loans 
                 (book_id, student_id, status) 
                 VALUES ($1, $2, 'issued') 
                 RETURNING *`,
                [bookId, studentId]
            );

            await client.query('COMMIT');
            return rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    // Возврат книги с увеличением количества
    static async return(loanId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Получаем информацию о выдаче
            const { rows } = await client.query(
                'SELECT book_id FROM book_loans WHERE id = $1 FOR UPDATE',
                [loanId]
            );

            if (!rows[0]) throw new Error('Выдача не найдена');

            // Обновляем статус выдачи
            await client.query(
                `UPDATE book_loans 
                 SET return_date = CURRENT_DATE, status = 'returned' 
                 WHERE id = $1`,
                [loanId]
            );

            // Увеличиваем количество книг
            await client.query(
                'UPDATE books SET quantity = quantity + 1 WHERE id = $1',
                [rows[0].book_id]
            );

            await client.query('COMMIT');
            return true;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    // Получение всех выдач с информацией о книгах и студентах
    static async getAll() {
        const { rows } = await pool.query(`
            SELECT bl.*, 
                   b.title as book_title, b.author as book_author,
                   s.first_name, s.last_name, s.group_name
            FROM book_loans bl
            LEFT JOIN books b ON bl.book_id = b.id
            LEFT JOIN students s ON bl.student_id = s.id
            ORDER BY bl.loan_date DESC
        `);
        return rows;
    }

    // Получение выдач конкретного студента
    static async getByStudent(studentId) {
        const { rows } = await pool.query(`
            SELECT bl.*, b.title as book_title, b.author as book_author
            FROM book_loans bl
            LEFT JOIN books b ON bl.book_id = b.id
            WHERE bl.student_id = $1
            ORDER BY bl.loan_date DESC
        `, [studentId]);
        return rows;
    }
}

module.exports = Loan;