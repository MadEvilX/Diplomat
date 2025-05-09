document.addEventListener('DOMContentLoaded', async () => {
    // Проверка авторизации и роли
    if (!checkAuth() || JSON.parse(localStorage.getItem('user')).role !== 'admin') {
        window.location.href = '/login.html';
        return;
    }

    // Элементы
    const statElements = {
        books: document.getElementById('total-books'),
        available: document.getElementById('available-books'),
        users: document.getElementById('total-users'),
        loans: document.getElementById('active-loans')
    };
    const activityList = document.getElementById('activity-list');
    const logoutBtn = document.getElementById('logout-btn');

    // Навигация по клику на карточки
    function setupCardNavigation() {
        document.getElementById('total-books').closest('.stat-card').addEventListener('click', () => {
            window.location.href = '/admin/books.html';
        });

        document.getElementById('total-users').closest('.stat-card').addEventListener('click', () => {
            window.location.href = '/admin/users.html';
        });
    }

    // Загрузка данных
    async function loadDashboardData() {
        try {
            const response = await fetch('/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();

            // Заполняем статистику
            statElements.books.textContent = data.totalBooks;
            statElements.available.textContent = data.availableBooks;
            statElements.users.textContent = data.totalUsers;
            statElements.loans.textContent = data.activeLoans;

            // Заполняем последние действия с кликабельными элементами
            activityList.innerHTML = data.recentActivities.map(activity => `
                <div class="activity-item" data-id="${activity.id}" data-type="${activity.type}">
                    <div class="activity-type ${activity.type}">${getActivityTypeName(activity.type)}</div>
                    <div class="activity-details">${activity.description}</div>
                    <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
                </div>
            `).join('');

            // Добавляем обработчики для действий
            document.querySelectorAll('.activity-item').forEach(item => {
                item.addEventListener('click', () => handleActivityClick(item.dataset));
            });

        } catch (err) {
            console.error('Ошибка загрузки данных:', err);
            alert('Не удалось загрузить данные dashboard');
        }
    }

    // Обработка клика на активность
    function handleActivityClick({ id, type }) {
        switch (type) {
            case 'book':
                window.location.href = `/admin/books.html?highlight=${id}`;
                break;
            case 'user':
                window.location.href = `/admin/users.html?highlight=${id}`;
                break;
            case 'loan':
                window.location.href = `/admin/loans.html?highlight=${id}`;
                break;
        }
    }

    // Преобразование типа активности
    function getActivityTypeName(type) {
        const types = {
            'book': 'Книга',
            'user': 'Пользователь',
            'loan': 'Выдача'
        };
        return types[type] || type;
    }

    // Выход из системы
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });

    // Инициализация
    setupCardNavigation();
    loadDashboardData();
});