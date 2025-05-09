document.addEventListener('DOMContentLoaded', async () => {
    // Проверка авторизации
    if (!checkAuth()) {
        window.location.href = '/login.html';
        return;
    }

    // Элементы
    const booksGrid = document.getElementById('books-list');
    const searchInput = document.getElementById('book-search');
    const searchBtn = document.getElementById('book-search-btn');
    const loanBookBtn = document.getElementById('loan-book-btn');
    const modal = document.getElementById('loan-modal');
    const loanForm = document.getElementById('loan-form');
    const logoutBtn = document.getElementById('logout-btn');

    let allBooks = [];
    let allUsers = [];
    let currentPage = 1;
    const booksPerPage = 12;

    // Загрузка данных
    async function loadData() {
        try {
            // Загружаем книги
            const booksResponse = await fetch('/api/books', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            allBooks = await booksResponse.json();

            // Загружаем пользователей (для выдачи книг)
            const usersResponse = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            allUsers = await usersResponse.json();

            renderBooks();
        } catch (err) {
            console.error('Ошибка загрузки данных:', err);
            booksGrid.innerHTML = '<div class="error">Ошибка загрузки данных</div>';
        }
    }

    // Отображение книг
    function renderBooks() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredBooks = allBooks.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm)
        );

        const startIdx = (currentPage - 1) * booksPerPage;
        const paginatedBooks = filteredBooks.slice(startIdx, startIdx + booksPerPage);

        booksGrid.innerHTML = paginatedBooks.map(book => `
            <div class="book-card">
                <div class="book-cover">${book.title.charAt(0)}${book.author.charAt(0)}</div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <div class="book-meta">
                        <span class="book-year">${book.year} г.</span>
                        <span class="book-available ${book.quantity > 0 ? 'available' : 'unavailable'}">
                            ${book.quantity > 0 ? `${book.quantity} шт.` : 'Нет в наличии'}
                        </span>
                    </div>
                    ${book.quantity > 0 ?
                `<button class="loan-btn" data-id="${book.id}">Выдать</button>` : ''}
                </div>
            </div>
        `).join('');

        // Добавляем обработчики для кнопок выдачи
        document.querySelectorAll('.loan-btn').forEach(btn => {
            btn.addEventListener('click', () => openLoanModal(btn.dataset.id));
        });
    }

    // Открытие модального окна выдачи
    function openLoanModal(bookId) {
        const book = allBooks.find(b => b.id == bookId);
        document.getElementById('loan-book').value = `${book.title} (${book.author})`;

        // Заполняем список пользователей
        const userSelect = document.getElementById('loan-user');
        userSelect.innerHTML = allUsers.map(user => `
            <option value="${user.id}">${user.name} (${user.email})</option>
        `).join('');

        // Устанавливаем дату возврата (по умолчанию +14 дней)
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + 14);
        document.getElementById('loan-date').valueAsDate = returnDate;

        modal.style.display = 'flex';
    }

    // Оформление выдачи книги
    loanForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const loanData = {
            bookId: document.querySelector('.loan-btn').dataset.id,
            userId: document.getElementById('loan-user').value,
            dueDate: document.getElementById('loan-date').value
        };

        try {
            const response = await fetch('/api/loans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(loanData)
            });

            if (response.ok) {
                modal.style.display = 'none';
                loadData(); // Перезагружаем данные
                alert('Книга успешно выдана');
            } else {
                alert('Ошибка выдачи книги');
            }
        } catch (err) {
            console.error('Ошибка:', err);
            alert('Ошибка соединения');
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

    // Выход из системы
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });

    // Инициализация
    loadData();
});