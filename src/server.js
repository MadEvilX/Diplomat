// Импортируем express
const express = require('express');

const booksRouter = require('./routes/books'); // Импортируем роутер для книг
const usersRouter = require('./routes/users'); // Импортируем роутер для пользователей
const loansRouter = require('./routes/loans'); // Импортируем роутер для выдачи книг

// Создаем экземпляр приложения
const app = express();

// Указываем порт, на котором будет работать сервер
const port = 3000;

// Middleware для обработки JSON
app.use(express.json());

// Подключаем маршруты для пользователей
app.use('/users', usersRouter);

// Подключаем маршруты для книг
app.use('/books', booksRouter);

// Подключаем маршруты для выдачи книг
app.use('/loans', loansRouter);

// Запускаем сервер
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});