document.addEventListener('DOMContentLoaded', async () => {
    const booksList = document.getElementById('books-list');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const sortSelect = document.getElementById('sort-by');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    let currentPage = 1;
    const booksPerPage = 12;
    let allBooks = [];

    // Загрузка книг с сервера
    async function loadBooks() {
        try {
            booksList.innerHTML = '<div class="loading">Загрузка книг...</div>';

            const response = await fetch('/api/books/public');
            if (!response.ok) throw new Error('Ошибка загрузки книг');

            allBooks = await response.json();
            renderBooks();
        } catch (err) {
            console.error('Ошибка:', err);
            booksList.innerHTML = `
                <div class="error">
                    Ошибка загрузки: ${err.message}
                    <button onclick="location.reload()">Повторить</button>
                </div>
            `;
        }
    }

    // Рендеринг книг
    function renderBooks() {
        // Фильтрация по поиску
        const searchTerm = searchInput.value.toLowerCase();
        let filteredBooks = allBooks.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            (book.genre && book.genre.toLowerCase().includes(searchTerm))
        );

        // Сортировка
        switch (sortSelect.value) {
            case 'title-desc':
                filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'year':
                filteredBooks.sort((a, b) => b.year - a.year);
                break;
            case 'year-old':
                filteredBooks.sort((a, b) => a.year - b.year);
                break;
            default: // 'title'
                filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
        }

        // Пагинация
        const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
        const startIdx = (currentPage - 1) * booksPerPage;
        const paginatedBooks = filteredBooks.slice(startIdx, startIdx + booksPerPage);

        // Отображение
        booksList.innerHTML = paginatedBooks.map(book => `
            <div class="book-card">
                <div class="book-cover">${book.title.charAt(0)}${book.author.charAt(0)}</div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <div class="book-meta">
                        <span class="book-year">${book.year}</span>
                        <span class="book-genre">${book.genre || 'Без жанра'}</span>
                    </div>
                    <div class="book-available">Доступно: ${book.quantity} шт.</div>
                </div>
            </div>
        `).join('') || '<div class="no-books">Книги не найдены</div>';

        // Обновление пагинации
        pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }

    // Обработчики событий
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        renderBooks();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentPage = 1;
            renderBooks();
        }
    });

    sortSelect.addEventListener('change', renderBooks);
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderBooks();
        }
    });
    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        renderBooks();
    });

    // Инициализация
    loadBooks();
});