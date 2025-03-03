// Импортируем express
const express = require('express');

// Импортируем роутер для книг
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');

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

// Запускаем сервер
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});