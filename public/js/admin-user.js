document.addEventListener('DOMContentLoaded', async () => {
    // Проверка авторизации
    if (!checkAuth() || JSON.parse(localStorage.getItem('user')).role !== 'admin') {
        window.location.href = '/login.html';
        return;
    }

    // Элементы
    const usersTable = document.getElementById('users-table').querySelector('tbody');
    const searchInput = document.getElementById('user-search');
    const searchBtn = document.getElementById('user-search-btn');
    const addUserBtn = document.getElementById('add-user-btn');
    const modal = document.getElementById('user-modal');
    const userForm = document.getElementById('user-form');
    const logoutBtn = document.getElementById('logout-btn');

    let allUsers = [];
    let currentPage = 1;
    const usersPerPage = 10;

    // Загрузка пользователей
    async function loadUsers() {
        try {
            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            allUsers = await response.json();
            renderUsers();
        } catch (err) {
            console.error('Ошибка загрузки пользователей:', err);
            usersTable.innerHTML = '<tr><td colspan="5">Ошибка загрузки данных</td></tr>';
        }
    }

    // Отображение пользователей
    function renderUsers() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredUsers = allUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );

        const startIdx = (currentPage - 1) * usersPerPage;
        const paginatedUsers = filteredUsers.slice(startIdx, startIdx + usersPerPage);

        usersTable.innerHTML = paginatedUsers.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role === 'admin' ? 'Администратор' : 'Библиотекарь'}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="edit-btn" data-id="${user.id}">✏️</button>
                    <button class="delete-btn" data-id="${user.id}">🗑️</button>
                </td>
            </tr>
        `).join('');

        // Обработчики для кнопок
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteUser(btn.dataset.id));
        });
    }

    // Работа с модальным окном
    function openEditModal(userId = null) {
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('user-form');

        if (userId) {
            // Режим редактирования
            const user = allUsers.find(u => u.id == userId);
            modalTitle.textContent = 'Редактировать пользователя';
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-name').value = user.name;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-role').value = user.role;
            document.getElementById('user-password').required = false;
        } else {
            // Режим добавления
            modalTitle.textContent = 'Добавить пользователя';
            form.reset();
            document.getElementById('user-password').required = true;
        }

        modal.style.display = 'flex';
    }

    // Сохранение пользователя
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = {
            id: document.getElementById('user-id').value || null,
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            role: document.getElementById('user-role').value,
            password: document.getElementById('user-password').value
        };

        try {
            const url = userData.id ? `/api/admin/users/${userData.id}` : '/api/admin/users';
            const method = userData.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                modal.style.display = 'none';
                loadUsers(); // Перезагружаем список
            } else {
                alert('Ошибка сохранения пользователя');
            }
        } catch (err) {
            console.error('Ошибка:', err);
            alert('Ошибка соединения');
        }
    });

    // Удаление пользователя
    async function deleteUser(userId) {
        if (!confirm('Удалить этого пользователя?')) return;

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                loadUsers(); // Перезагружаем список
            } else {
                alert('Ошибка удаления пользователя');
            }
        } catch (err) {
            console.error('Ошибка:', err);
            alert('Ошибка соединения');
        }
    }

    // Закрытие модального окна
    document.getElementById('cancel-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Поиск пользователей
    searchBtn.addEventListener('click', renderUsers);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') renderUsers();
    });

    // Добавление нового пользователя
    addUserBtn.addEventListener('click', () => openEditModal());

    // Выход из системы
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });

    // Инициализация
    loadUsers();
});