// Импортируем Pool из библиотеки pg
const { Pool } = require('pg');

// Создаем новый пул подключений к PostgreSQL
const pool = new Pool({
    user: 'postgres',       // Имя пользователя PostgreSQL
    host: 'localhost',      // Хост, на котором работает PostgreSQL
    database: 'library',    // Название базы данных
    password: '123', // Пароль пользователя
    port: 5432,          // Порт, на котором работает PostgreSQL
});
// Тестовый запрос
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
    } else {
        console.log('Подключение к базе данных успешно:', res.rows[0]);
    }
});

// Экспортируем pool, чтобы его можно было использовать в других файлах
module.exports = pool;