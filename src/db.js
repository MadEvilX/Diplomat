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

// Экспортируем pool, чтобы его можно было использовать в других файлах
module.exports = pool;