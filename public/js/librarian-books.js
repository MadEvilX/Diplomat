document.addEventListener('DOMContentLoaded', async () => {
    // Проверка авторизации
    if (!checkAuth()) {
        window.location.href = '/login.html';
        return;
    }

    // Элементы
    const booksTable = document.getElementById('books-table').querySelector('tbody');
    const searchInput = document.getElementById('book-search');
    const searchBtn = document.getElementById('book-search-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const modal = document.getElementById('loan-modal');
    const loanForm = document.getElementById('loan-form');

    let allBooks = [];
    let allStudents = [];
    let currentPage = 1;
    const booksPerPage = 10;
    let selectedBookId = null;

    // Загрузка данных
    async function loadData() {
        try {
            // Загружаем книги
            const booksResponse = await fetch('/api/books', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            allBooks = await booksResponse.json();

            // Загружаем студентов
            const studentsResponse = await fetch('/api/students', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            allStudents = await studentsResponse.json();

            renderBooks();
        } catch (err) {
            console.error('Ошибка загрузки данных:', err);
            booksTable.innerHTML = '<tr><td colspan="6">Ошибка загрузки данных</td></tr>';
        }
    }

    // Отображение книг
    function renderBooks() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredBooks = allBooks.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.genre.toLowerCase().includes(searchTerm)
        );

        const totalPages = Math.max(1, Math.ceil(filteredBooks.length / booksPerPage));
        currentPage = Math.min(currentPage, totalPages);
        const startIdx = (currentPage - 1) * booksPerPage;
        const paginatedBooks = filteredBooks.slice(startIdx, startIdx + booksPerPage);

        booksTable.innerHTML = paginatedBooks.map(book => `
            <tr>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.year}</td>
                <td>${book.genre}</td>
                <td>${book.quantity}</td>
                <td>
                    ${book.quantity > 0 ?
                `<button class="librarian-btn-primary loan-btn" data-id="${book.id}">Выдать</button>` :
                '<span style="color: var(--light-text);">Нет в наличии</span>'}
                </td>
            </tr>
        `).join('');

        // Обновление пагинации
        document.getElementById('page-info').textContent = `Страница ${currentPage} из ${totalPages}`;
        document.getElementById('prev-page').disabled = currentPage <= 1;
        document.getElementById('next-page').disabled = currentPage >= totalPages;

        // Добавляем обработчики для кнопок выдачи
        document.querySelectorAll('.loan-btn').forEach(btn => {
            btn.addEventListener('click', () => openLoanModal(btn.dataset.id));
        });
    }

    // Открытие модального окна выдачи
    function openLoanModal(bookId) {
        selectedBookId = bookId;
        const book = allBooks.find(b => b.id == bookId);
        document.getElementById('loan-book').value = `${book.title} (${book.author})`;

        // Заполняем список студентов
        const userSelect = document.getElementById('loan-user');
        userSelect.innerHTML = allStudents.map(student => `
            <option value="${student.id}">
                ${student.last_name} ${student.first_name} (${student.group_name})
            </option>
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

        try {
            const response = await fetch('/api/loans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    bookId: selectedBookId,
                    studentId: document.getElementById('loan-user').value,
                    dueDate: document.getElementById('loan-date').value
                })
            });

            if (!response.ok) {
                throw new Error('Ошибка выдачи книги');
            }

            modal.style.display = 'none';
            await loadData(); // Перезагружаем данные
            alert('Книга успешно выдана');
        } catch (err) {
            console.error('Ошибка:', err);
            alert(err.message);
        }
    });

    // Закрытие модального окна
    document.getElementById('cancel-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Пагинация
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderBooks();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        const totalPages = Math.ceil(allBooks.length / booksPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderBooks();
        }
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