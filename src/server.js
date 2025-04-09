// Импортируем express
const express = require('express');
require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET); // Проверка
const cors = require('cors');
const booksRouter = require('./routes/books'); // Импортируем роутер для книг
const usersRouter = require('./routes/users'); // Импортируем роутер для пользователей
const loansRouter = require('./routes/loans'); // Импортируем роутер для выдачи книг
const authRouter = require('./routes/auth'); // Импортируем роутер для авторизации
const errorHandler = require('./middleware/errorHandler');
const path = require('path'); // Импортируем модуль path

const app = express();// Создаем экземпляр приложения

const port = 3000;// Указываем порт, на котором будет работать сервер

app.use(express.json());// Middleware для обработки JSON


// Добавьте перед обработчиками маршрутов
app.use(cors({
    origin: 'http://localhost:3000', // или ваш домен
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Обработка OPTIONS для preflight
app.options('*', cors());

app.use('/users', usersRouter);// Подключаем маршруты для пользователей
app.use('/books', booksRouter);// Подключаем маршруты для книг
app.use('/loans', loansRouter);// Подключаем маршруты для выдачи книг
app.use('/auth', authRouter);

app.use(express.static(path.join(__dirname, '../public')));// Middleware для обслуживания статических файлов
app.use(errorHandler);// Middleware для обработки ошибок

// Запускаем сервер
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
