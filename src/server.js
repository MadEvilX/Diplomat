require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Количество раундов хеширования

// Инициализация приложения
const app = express();
const port = process.env.PORT || 3000;

// Подключение к PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'library',
    password: process.env.DB_PASSWORD || '123',
    port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Middleware для проверки ролей
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Доступ запрещён' });
        }
        next();
    };
};

// Маршруты аутентификации
const authRouter = express.Router();

// Изменённый обработчик входа
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Находим пользователя по email
        const userResult = await pool.query(
            'SELECT id, email, role, password_hash FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }

        const user = userResult.rows[0];

        // 2. Сравниваем пароль с хешем из БД
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Неверные учетные данные' });
        }

        // 3. Генерация JWT токена
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Не возвращаем хеш пароля
        const { password_hash, ...userData } = user;
        res.json({ token, user: userData });

    } catch (err) {
        console.error('Ошибка входа:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Публичный доступ к книгам (без авторизации)
app.get('/api/books/public', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, title, author, year, genre, quantity 
            FROM books 
            WHERE quantity > 0
            ORDER BY title
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Ошибка получения книг:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Маршруты для книг
const booksRouter = express.Router();

// Получение списка книг (доступно всем авторизованным пользователям)
booksRouter.get('/', authenticateToken, async (req, res) => {
    try {
        // Логика получения книг с пагинацией
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT id, title, author, year, quantity 
       FROM books 
       ORDER BY title
       LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await pool.query('SELECT COUNT(*) FROM books');
        const total = parseInt(countResult.rows[0].count);

        res.json({
            books: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Ошибка получения книг:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Добавление новой книги (только для администраторов)
booksRouter.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { title, author, year, quantity } = req.body;

        const result = await pool.query(`
            INSERT INTO books (title, author, year, quantity, genre)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, title, author, year, quantity, genre
          `, [title, author, year, quantity, req.body.genre || 'Не указан']);

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('Ошибка добавления книги:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Маршруты для администратора
const adminRouter = express.Router();

adminRouter.get('/dashboard', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        // Получаем статистику для дашборда
        const booksCount = await pool.query('SELECT COUNT(*) FROM books');
        const usersCount = await pool.query('SELECT COUNT(*) FROM users');
        const activeLoans = await pool.query(
            `SELECT COUNT(*) FROM loans 
       WHERE returned_date IS NULL`
        );

        res.json({
            stats: {
                books: parseInt(booksCount.rows[0].count),
                users: parseInt(usersCount.rows[0].count),
                activeLoans: parseInt(activeLoans.rows[0].count)
            }
        });
    } catch (err) {
        console.error('Ошибка получения статистики:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Маршрут для статистики дашборда
app.get('/api/admin/stats', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        // Получаем статистику
        const booksCount = await pool.query('SELECT COUNT(*) FROM books');
        const availableBooks = await pool.query('SELECT COUNT(*) FROM books WHERE quantity > 0');
        const usersCount = await pool.query('SELECT COUNT(*) FROM users');
        const activeLoans = await pool.query(
            `SELECT COUNT(*) FROM loans WHERE returned_date IS NULL`
        );

        // Получаем последние активности
        const recentActivities = await pool.query(`
            (SELECT id, 'book' as type, title as description, created_at as timestamp
             FROM books ORDER BY created_at DESC LIMIT 3)
            UNION ALL
            (SELECT id, 'user' as type, email as description, created_at as timestamp
             FROM users ORDER BY created_at DESC LIMIT 3)
            UNION ALL
            (SELECT id, 'loan' as type, 
             CONCAT('Выдача #', id) as description, loan_date as timestamp
             FROM loans ORDER BY loan_date DESC LIMIT 3)
            ORDER BY timestamp DESC LIMIT 5
        `);

        res.json({
            totalBooks: parseInt(booksCount.rows[0].count),
            availableBooks: parseInt(availableBooks.rows[0].count),
            totalUsers: parseInt(usersCount.rows[0].count),
            activeLoans: parseInt(activeLoans.rows[0].count),
            recentActivities: recentActivities.rows
        });
    } catch (err) {
        console.error('Ошибка получения статистики:', err);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// Подключение маршрутов
app.use('/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/admin', adminRouter);

// Обработка 404
app.use((req, res) => {
    res.status(404).json({ message: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Проверка подключения к БД при запуске
pool.query('SELECT NOW()')
    .then(() => console.log('Подключение к PostgreSQL установлено'))
    .catch(err => {
        console.error('Ошибка подключения к PostgreSQL:', err);
        process.exit(1);
    });

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});