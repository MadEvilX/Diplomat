document.addEventListener('DOMContentLoaded', async () => {
    // Проверка авторизации
    if (!checkAuth() || !['admin', 'librarian'].includes(JSON.parse(localStorage.getItem('user')).role)) {
        window.location.href = '/login.html';
        return;
    }

    // Элементы
    const studentsTable = document.getElementById('students-table').querySelector('tbody');
    const addStudentBtn = document.getElementById('add-student-btn');
    const studentModal = document.getElementById('student-modal');
    const studentForm = document.getElementById('student-form');
    const searchInput = document.getElementById('student-search');
    const searchBtn = document.getElementById('student-search-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const logoutBtn = document.getElementById('logout-btn');

    let allStudents = [];

    // Загрузка студентов
    async function loadStudents() {
        try {
            const response = await fetch('/api/students', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            allStudents = await response.json();
            renderStudents();
        } catch (err) {
            console.error('Ошибка загрузки студентов:', err);
            studentsTable.innerHTML = '<tr><td colspan="5">Ошибка загрузки данных</td></tr>';
        }
    }

    // Отображение студентов
    function renderStudents(students = allStudents) {
        studentsTable.innerHTML = students.map(student => `
            <tr>
                <td>${student.last_name} ${student.first_name}</td>
                <td>${student.group_name}</td>
                <td>${student.email}</td>
                <td>${student.active_loans || 0}</td>
                <td>
                    <button class="btn-primary issue-btn" data-id="${student.id}">Выдать книгу</button>
                    <button class="btn-edit edit-btn" data-id="${student.id}">✏️</button>
                    <button class="btn-delete delete-btn" data-id="${student.id}">🗑️</button>
                </td>
            </tr>
        `).join('');

        // Назначение обработчиков
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteStudent(btn.dataset.id));
        });
    }

    // Открытие модального окна для редактирования
    function openEditModal(studentId = null) {
        const modalTitle = document.getElementById('modal-title');

        if (studentId) {
            // Режим редактирования
            const student = allStudents.find(s => s.id == studentId);
            modalTitle.textContent = 'Редактировать студента';
            document.getElementById('student-id').value = student.id;
            document.getElementById('student-first-name').value = student.first_name;
            document.getElementById('student-last-name').value = student.last_name;
            document.getElementById('student-group').value = student.group_name;
            document.getElementById('student-email').value = student.email;
        } else {
            // Режим добавления
            modalTitle.textContent = 'Добавить студента';
            document.getElementById('student-form').reset();
            document.getElementById('student-id').value = '';
        }

        studentModal.style.display = 'flex';
    }

    // Закрытие модального окна
    function closeModal() {
        studentModal.style.display = 'none';
    }

    // Сохранение студента
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const studentData = {
            firstName: document.getElementById('student-first-name').value.trim(),
            lastName: document.getElementById('student-last-name').value.trim(),
            groupName: document.getElementById('student-group').value.trim(),
            email: document.getElementById('student-email').value.trim()
        };

        // Валидация
        if (!studentData.firstName || !studentData.lastName ||
            !studentData.groupName || !studentData.email) {
            alert('Все поля обязательны для заполнения');
            return;
        }

        const studentId = document.getElementById('student-id').value;
        const method = studentId ? 'PUT' : 'POST';
        const url = studentId ? `/api/students/${studentId}` : '/api/students';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(studentData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Ошибка сервера');
            }

            closeModal();
            await loadStudents(); // Обновляем список
        } catch (err) {
            console.error('Ошибка:', err);
            alert(`Ошибка: ${err.message}`);
        }
    });

    // Удаление студента
    async function deleteStudent(studentId) {
        if (!confirm('Вы уверены, что хотите удалить этого студента?')) return;

        try {
            const response = await fetch(`/api/students/${studentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Ошибка сервера');
            }

            await loadStudents(); // Обновляем список
        } catch (err) {
            console.error('Ошибка:', err);
            alert(`Ошибка: ${err.message}`);
        }
    }

    // Поиск студентов
    searchBtn.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filtered = allStudents.filter(student =>
            student.first_name.toLowerCase().includes(searchTerm) ||
            student.last_name.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm)
        );
        renderStudents(filtered);
    });

    // Закрытие модального окна по кнопке Отмена
    cancelBtn.addEventListener('click', closeModal);

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (e) => {
        if (e.target === studentModal) {
            closeModal();
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });

    // Инициализация
    await loadStudents();
    addStudentBtn.addEventListener('click', () => openEditModal());
});