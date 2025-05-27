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

    // Добавим обработчик для кнопки "Выдать книгу"
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('issue-btn')) {
            const studentId = e.target.dataset.id;
            // Здесь можно открыть модальное окно для выбора книги
            openIssueBookModal(studentId);
        }
    });

    // Функция для открытия модального окна выдачи книги
    async function openIssueBookModal(studentId) {
        try {
            // Загружаем доступные книги
            const response = await fetch('/api/books/available', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки доступных книг');
            }

            const books = await response.json();

            // Заполняем выпадающий список
            const bookSelect = document.getElementById('book-select');
            bookSelect.innerHTML = books.map(book =>
                `<option value="${book.id}">${book.title} (${book.author})</option>`
            ).join('');

            // Устанавливаем ID студента
            document.getElementById('issue-student-id').value = studentId;

            // Показываем модальное окно
            document.getElementById('issue-book-modal').style.display = 'flex';
        } catch (err) {
            console.error('Ошибка:', err);
            alert(`Ошибка: ${err.message}`);
        }
    }

    // Обработчик формы выдачи книги
    document.getElementById('issue-book-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const dueDateInput = document.getElementById('due-date');
        const dueDate = dueDateInput.value;

        // Проверка значения даты
        if (!dueDate) {
            alert('Выберите дату возврата!');
            dueDateInput.focus();
            return;
        }

        try {
            const response = await fetch('/api/loans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    bookId: parseInt(document.getElementById('book-select').value),
                    studentId: parseInt(document.getElementById('issue-student-id').value),
                    dueDate: dueDate // Отправляем как есть, без преобразований
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            alert('Книга успешно выдана!');
            document.getElementById('issue-book-modal').style.display = 'none';
        } catch (err) {
            console.error('Error:', err);
            alert(`Ошибка: ${err.message}`);
        }
    });

    document.getElementById('cancel-issue-btn').addEventListener('click', () => {
        document.getElementById('issue-book-modal').style.display = 'none';
    });

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