document.addEventListener('DOMContentLoaded', async () => {
    // Проверка авторизации
    if (!checkAuth() || !['admin', 'librarian'].includes(JSON.parse(localStorage.getItem('user')).role)) {
        window.location.href = '/login.html';
        return;
    }

    // Элементы
    const totalBooksEl = document.getElementById('total-books');
    const availableBooksEl = document.getElementById('available-books');
    const totalStudentsEl = document.getElementById('total-users');
    const activeLoansEl = document.getElementById('active-loans');
    const activityList = document.getElementById('activity-list');
    const logoutBtn = document.getElementById('logout-btn');

    // Загрузка статистики
    async function loadStats() {
        try {
            // Загружаем данные параллельно
            const [booksRes, studentsRes, loansRes] = await Promise.all([
                fetch('/api/books', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch('/api/students', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch('/api/loans', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            const books = await booksRes.json();
            const students = await studentsRes.json();
            const loans = await loansRes.json();

            // Обновляем статистику
            totalBooksEl.textContent = books.length;
            availableBooksEl.textContent = books.reduce((sum, book) => sum + book.quantity, 0);
            totalStudentsEl.textContent = students.length;
            activeLoansEl.textContent = loans.filter(loan => loan.status === 'issued').length;

            // Загружаем последние выдачи книг
            loadRecentActivity(loans);
        } catch (err) {
            console.error('Ошибка загрузки статистики:', err);
        }
    }

    // Загрузка последних выдач книг
    async function loadRecentActivity(loans) {
        try {
            // Фильтруем только последние 5 выдач
            const recentLoans = loans
                .sort((a, b) => new Date(b.loan_date) - new Date(a.loan_date))
                .slice(0, 5);

            activityList.innerHTML = recentLoans.map(loan => `
                <div class="activity-item">
                    <div class="activity-icon">📖</div>
                    <div class="activity-details">
                        <div class="activity-title">${loan.book_title || 'Неизвестная книга'}</div>
                        <div class="activity-meta">
                            ${loan.first_name || ''} ${loan.last_name || ''} (${loan.group_name || ''}) • 
                            Выдано: ${formatDate(loan.loan_date)} → Вернуть: ${formatDate(loan.due_date)}
                            ${loan.status === 'overdue' ? ' ⚠️ Просрочено' : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error('Ошибка загрузки активности:', err);
            activityList.innerHTML = '<div class="error">Ошибка загрузки последних выдач</div>';
        }
    }

    // Форматирование даты
    function formatDate(dateString) {
        if (!dateString) return '—';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    }

    // Навигация по клику на карточки
    function setupCardNavigation() {
        document.getElementById('total-books').closest('.stat-card').addEventListener('click', () => {
            window.location.href = '/admin/books.html';
        });

        document.getElementById('total-users').closest('.stat-card').addEventListener('click', () => {
            window.location.href = '/admin/students.html';
        });

        document.getElementById('active-loans').closest('.stat-card').addEventListener('click', () => {
            window.location.href = '/admin/student-detals.html';
        });
    }

    // Выход из системы
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });

    // Инициализация
    setupCardNavigation();
    loadStats();
});