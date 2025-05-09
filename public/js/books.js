document.addEventListener('DOMContentLoaded', () => {
    const booksList = document.getElementById('books-list');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const genreFilter = document.getElementById('genre-filter');
    const yearFilter = document.getElementById('year-filter');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    let currentPage = 1;
    const booksPerPage = 12;
    let allBooks = [];

    // Загрузка книг
    async function loadBooks() {
        try {
            const response = await fetch('/api/books/public');
            if (!response.ok) throw new Error('Ошибка загрузки книг');

            allBooks = await response.json();
            renderBooks();
        } catch (err) {
            console.error('Ошибка:', err);
            booksList.innerHTML = '<p class="error">Не удалось загрузить книги. Пожалуйста, попробуйте позже.</p>';
        }
    }

    // Отображение книг
    function renderBooks() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedGenre = genreFilter.value;
        const selectedYear = yearFilter.value;

        // Фильтрация
        let filteredBooks = allBooks.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm);
            const matchesGenre = !selectedGenre || book.genre === selectedGenre;
            const matchesYear = !selectedYear || book.year >= selectedYear;

            return matchesSearch && matchesGenre && matchesYear;
        });

        // Пагинация
        const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
        const startIdx = (currentPage - 1) * booksPerPage;
        const paginatedBooks = filteredBooks.slice(startIdx, startIdx + booksPerPage);

        // Рендеринг
        booksList.innerHTML = paginatedBooks.map(book => `
            <div class="book-card">
                <div class="book-cover">${book.title.charAt(0)}${book.author.charAt(0)}</div>
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <p class="book-year">Год: ${book.year}</p>
                <p class="book-available">Доступно: ${book.quantity} шт.</p>
            </div>
        `).join('');

        // Обновление пагинации
        pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
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

    genreFilter.addEventListener('change', () => {
        currentPage = 1;
        renderBooks();
    });

    yearFilter.addEventListener('change', () => {
        currentPage = 1;
        renderBooks();
    });

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

document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const booksList = document.getElementById('books-list');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const sortBy = document.getElementById('sort-by');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    // Настройки
    let currentPage = 1;
    const booksPerPage = 12;
    let allBooks = [];

    // Загрузка книг
    async function loadBooks() {
        try {
            booksList.innerHTML = '<div class="loading">Загрузка книг...</div>';

            const response = await fetch('/api/books/public');
            if (!response.ok) throw new Error('Ошибка загрузки');

            allBooks = await response.json();
            renderBooks();
        } catch (err) {
            console.error('Ошибка:', err);
            booksList.innerHTML = `
                <div class="error-message">
                    <p>Не удалось загрузить список книг</p>
                    <button onclick="location.reload()">Попробовать снова</button>
                </div>
            `;
        }
    }

    // Рендеринг книг
    function renderBooks() {
        // Фильтрация
        const searchTerm = searchInput.value.toLowerCase();
        let filteredBooks = allBooks.filter(book => {
            return book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm);
        });

        // Сортировка
        switch (sortBy.value) {
            case 'title':
                filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc':
                filteredBooks.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'year':
                filteredBooks.sort((a, b) => b.year - a.year);
                break;
            case 'year-old':
                filteredBooks.sort((a, b) => a.year - b.year);
                break;
        }

        // Пагинация
        const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
        const startIdx = (currentPage - 1) * booksPerPage;
        const paginatedBooks = filteredBooks.slice(startIdx, startIdx + booksPerPage);

        // Рендеринг
        booksList.innerHTML = paginatedBooks.map(book => `
            <div class="book-card">
                <div class="book-cover">${book.title.charAt(0)}${book.author.charAt(0)}</div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <div class="book-meta">
                        <span class="book-year">${book.year} г.</span>
                        <span class="book-available">${book.quantity} шт.</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Обновление пагинации
        pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    // Обработчики событий
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        renderBooks();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') renderBooks();
    });

    sortBy.addEventListener('change', renderBooks);

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