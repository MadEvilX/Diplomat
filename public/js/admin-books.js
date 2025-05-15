document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const isAdmin = currentUser?.role === 'admin';
    // Проверка авторизации
    if (!checkAuth() || JSON.parse(localStorage.getItem('user')).role !== 'admin') {
        window.location.href = '/login.html';
        return;
    }


    // Элементы
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const booksTable = document.getElementById('books-table').querySelector('tbody');
    const searchInput = document.getElementById('book-search');
    const searchBtn = document.getElementById('book-search-btn');
    const addBookBtn = document.getElementById('add-book-btn');
    const modal = document.getElementById('book-modal');
    const bookForm = document.getElementById('book-form');
    const logoutBtn = document.getElementById('logout-btn');

    let allBooks = [];
    let currentPage = 1;
    const booksPerPage = 10;

    async function loadBooks() {
        try {
            booksTable.innerHTML = '<tr><td colspan="5">Загрузка...</td></tr>';

            const response = await fetch('/api/books', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Ошибка сервера');
            }

            const result = await response.json();

            // Извлекаем массив книг из ответа
            allBooks = result;

            console.log('Полученные книги:', allBooks); // Для отладки

            if (allBooks.length === 0) {
                booksTable.innerHTML = '<tr><td colspan="5">Книги не найдены</td></tr>';
                return;
            }

            renderBooks();
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            booksTable.innerHTML = `
            <tr>
                <td colspan="5">
                    Ошибка: ${err.message}
                    <button onclick="loadBooks()">Повторить</button>
                </td>
            </tr>
        `;
        }
    }

    function renderBooks() {
        // Фильтрация
        const searchTerm = searchInput.value.toLowerCase();
        const filteredBooks = allBooks.filter(book =>
            book.title?.toLowerCase().includes(searchTerm) ||
            book.author?.toLowerCase().includes(searchTerm) ||
            book.genre?.toLowerCase().includes(searchTerm)
        );

        // Пагинация
        const totalPages = Math.max(1, Math.ceil(filteredBooks.length / booksPerPage));
        currentPage = Math.min(currentPage, totalPages); // Защита от выхода за пределы

        const startIdx = (currentPage - 1) * booksPerPage;
        const paginatedBooks = filteredBooks.slice(startIdx, startIdx + booksPerPage);

        // Рендеринг
        booksTable.innerHTML = paginatedBooks.map(book => `
        <tr>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.year}</td>
            <td>${book.genre}</td>
            <td>${book.quantity}</td>
            <td>
                <button class="edit-btn" data-id="${book.id}">✏️</button>
                <button class="delete-btn" data-id="${book.id}">🗑️</button>
            </td>
        </tr>
    `).join('');

        // Обновление пагинации
        pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }

    document.addEventListener('click', async (e) => {
        // Обработка удаления
        if (e.target.classList.contains('delete-btn')) {
            const bookId = e.target.dataset.id;
            await deleteBook(bookId);
        }

        // Обработка редактирования
        if (e.target.classList.contains('edit-btn')) {
            const bookId = e.target.dataset.id;
            openEditModal(bookId);
        }
    });

    async function deleteBook(bookId) {
        if (!isAdmin) {
            alert('Только администраторы могут удалять книги');
            return;
        }

        if (!confirm('Вы уверены, что хотите удалить эту книгу?')) return;

        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Ошибка сервера');
            }

            // Локальное обновление
            allBooks = allBooks.filter(book => book.id != bookId);
            currentPage = 1; // Сброс пагинации
            renderBooks();

        } catch (err) {
            console.error('Ошибка удаления:', err);
            alert(`Ошибка: ${err.message}`);
        }
    }

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderBooks();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allBooks.length / booksPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderBooks();
        }
    });

    // Работа с модальным окном
    function openEditModal(bookId = null) {
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('book-form');

        if (bookId) {
            // Режим редактирования
            const book = allBooks.find(b => b.id == bookId);
            modalTitle.textContent = 'Редактировать книгу';
            document.getElementById('book-id').value = book.id;
            document.getElementById('book-title').value = book.title;
            document.getElementById('book-author').value = book.author;
            document.getElementById('book-year').value = book.year;
            document.getElementById('book-quantity').value = book.quantity;
        } else {
            // Режим добавления
            modalTitle.textContent = 'Добавить книгу';
            form.reset();
        }

        modal.style.display = 'flex';
    }

    // Сохранение книги

    bookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Получаем данные формы
        const bookId = document.getElementById('book-id').value;
        const isEditMode = !!bookId;
        const year = parseInt(document.getElementById('book-year').value);
        const currentYear = new Date().getFullYear();

        const genreValue = document.getElementById('book-genre').value.trim();
        if (!genreValue) {
            alert('Поле "Жанр" обязательно для заполнения');
            return;
        }


        // Валидация на фронтенде
        if (year > currentYear) {
            alert(`Год издания не может быть больше ${currentYear}`);
            return;
        }

        // Подготовка URL и метода
        const url = isEditMode ? `/api/books/${bookId}` : '/api/books';
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: document.getElementById('book-title').value,
                    author: document.getElementById('book-author').value,
                    year: year, // Используем уже полученное значение
                    quantity: document.getElementById('book-quantity').value,
                    genre: document.getElementById('book-genre').value
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Ошибка сервера');
            }

            modal.style.display = 'none';
            await loadBooks();
        } catch (err) {
            console.error('Ошибка:', err);
            alert(`Ошибка: ${err.message}`);
        }
    });

    // Закрытие модального окна
    document.getElementById('cancel-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Поиск книг
    searchBtn.addEventListener('click', renderBooks);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') renderBooks();
    });

    // Добавление новой книги
    addBookBtn.addEventListener('click', () => openEditModal());

    // Выход из системы
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });

    // Инициализация
    loadBooks();
});