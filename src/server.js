const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Добро пожаловать в библиотеку!');
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

const booksRouter = require('./routes/books');
app.use('/books', booksRouter);

app.use(express.static('public'));