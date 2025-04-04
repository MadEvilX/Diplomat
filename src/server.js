// Импортируем express
const express = require('express');
require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET); // Проверка

const booksRouter = require('./routes/books'); // Импортируем роутер для книг
const usersRouter = require('./routes/users'); // Импортируем роутер для пользователей
const loansRouter = require('./routes/loans'); // Импортируем роутер для выдачи книг
const authRouter = require('./routes/auth'); // Импортируем роутер для авторизации
const errorHandler = require('./middleware/errorHandler');
const path = require('path'); // Импортируем модуль path

const app = express();// Создаем экземпляр приложения

const port = 3000;// Указываем порт, на котором будет работать сервер

app.use(express.json());// Middleware для обработки JSON



app.use('/users', usersRouter);// Подключаем маршруты для пользователей
app.use('/books', booksRouter);// Подключаем маршруты для книг
app.use('/loans', loansRouter);// Подключаем маршруты для выдачи книг
app.use('/auth', authRouter);

app.use(express.static(path.join(__dirname, '../public')));// Middleware для обслуживания статических файлов
app.use(errorHandler);// Middleware для обработки ошибок
const cors = require('cors');
app.use(cors()); // Разрешить все домены (для разработки)

// Запускаем сервер
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

