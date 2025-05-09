document.addEventListener('DOMContentLoaded', async () => {
    // Проверка авторизации
    if (!checkAuth() || JSON.parse(localStorage.getItem('user')).role !== 'admin') {
        window.location.href = '/login.html';
        return;
    }

    // Элементы
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

            if (!response.ok) throw new Error(await response.text());

            allBooks = await response.json();

            if (allBooks.length === 0) {
                booksTable.innerHTML = '<tr><td colspan="5">Книги не найдены</td></tr>';
                return;
            }

            renderBooks();
        } catch (err) {
            console.error('Ошибка загрузки:', err);
            booksTable.innerHTML = `<tr><td colspan="5">Ошибка: ${err.message}</td></tr>`;
        }
    }

    // Отображение книг
    function renderBooks() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredBooks = allBooks.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm)
        );

        const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
        const startIdx = (currentPage - 1) * booksPerPage;
        const paginatedBooks = filteredBooks.slice(startIdx, startIdx + booksPerPage);

        // Рендеринг таблицы
        booksTable.innerHTML = paginatedBooks.map(book => `
        <tr>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.year}</td>
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

        // Добавьте обработчики для кнопок
        document.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (btn.classList.contains('edit-btn')) {
                    openEditModal(btn.dataset.id);
                } else {
                    deleteBook(btn.dataset.id);
                }
            });
        });
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

        const bookData = {
            title: document.getElementById('book-title').value,
            author: document.getElementById('book-author').value,
            year: document.getElementById('book-year').value,
            quantity: document.getElementById('book-quantity').value,
            genre: document.getElementById('book-genre').value || 'Не указан'
        };

        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(bookData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            modal.style.display = 'none';
            loadBooks();
        } catch (err) {
            console.error('Ошибка:', err);
            alert(`Ошибка сохранения: ${err.message}`);
        }
    });

    // Удаление книги
    async function deleteBook(bookId) {
        if (!confirm('Вы уверены, что хотите удалить эту книгу?')) return;

        try {
            const response = await fetch(`/api/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            // Обновляем список книг после удаления
            await loadBooks();
        } catch (err) {
            console.error('Ошибка удаления:', err);
            alert(`Ошибка при удалении: ${err.message}`);
        }
    }

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