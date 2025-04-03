const Auth = require('./models/Auth');
const pool = require('./db');

async function initUsers() {
    try {
        // Проверяем существование пользователей
        const { rows } = await pool.query('SELECT email FROM users');
        const existingEmails = rows.map(row => row.email);

        // Добавляем/обновляем только если их нет
        if (!existingEmails.includes('admin@lib.ru')) {
            await Auth.register('Admin', 'admin@lib.ru', 'admin', 'admin123');
            console.log('Админ создан');
        }

        if (!existingEmails.includes('librarian@lib.ru')) {
            await Auth.register('Библиотекарь', 'librarian@lib.ru', 'librarian', 'lib123');
            console.log('Библиотекарь создан');
        }

        console.log('Готово! Проверьте БД:');
        console.log(await pool.query('SELECT email, role FROM users'));
    } catch (err) {
        console.error('Ошибка:', err);
    } finally {
        pool.end();
    }
}

initUsers();