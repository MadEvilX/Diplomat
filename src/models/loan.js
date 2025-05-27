// Импортируем пул подключений к базе данных
const pool = require('../db');

class Loan {
    // Выдача книги с уменьшением количества
    static async create(bookId, studentId, dueDate) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Жёсткая проверка и преобразование даты
            const dueDateObj = new Date(dueDate);
            if (isNaN(dueDateObj.getTime())) {
                throw new Error('Invalid due date');
            }
            const pgDueDate = dueDateObj.toISOString().split('T')[0];

            console.log('Final due_date to insert:', pgDueDate); // Важный лог

            const { rows } = await client.query(
                `INSERT INTO book_loans 
             (book_id, student_id, loan_date, due_date, status)
             VALUES ($1, $2, CURRENT_DATE, $3::date, 'issued')
             RETURNING *`,
                [bookId, studentId, pgDueDate]
            );

            await client.query('COMMIT');
            return rows[0];
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Loan creation failed:', {
                error: err,
                inputData: { bookId, studentId, dueDate }
            });
            throw err;
        } finally {
            client.release();
        }
    }
    // Измененный метод return в loan.js
    static async return(loanId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Получаем данные о выдаче
            const { rows } = await client.query(
                `UPDATE book_loans 
             SET return_date = CURRENT_DATE,
                 status = CASE 
                     WHEN CURRENT_DATE > due_date THEN 'overdue'
                     ELSE 'returned'
                 END
             WHERE id = $1
             RETURNING book_id`,
                [loanId]
            );

            if (rows.length === 0) throw new Error('Выдача не найдена');

            // 2. Увеличиваем количество книг
            await client.query(
                'UPDATE books SET quantity = quantity + 1 WHERE id = $1',
                [rows[0].book_id]
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
        try {
            const { rows } = await pool.query(`
            SELECT 
                bl.id, 
                b.title AS book_title, 
                b.author AS book_author,
                bl.loan_date,
                bl.due_date,
                bl.return_date,
                bl.status
            FROM book_loans bl
            JOIN books b ON bl.book_id = b.id
            WHERE bl.student_id = $1
            ORDER BY bl.loan_date DESC
        `, [studentId]);

            return rows;
        } catch (err) {
            console.error('Database query error:', err);
            throw err;
        }
    }
}

module.exports = Loan;