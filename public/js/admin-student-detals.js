document.addEventListener('DOMContentLoaded', async () => {
    // Проверка авторизации
    if (!checkAuth() || !['admin', 'librarian'].includes(JSON.parse(localStorage.getItem('user')).role)) {
        window.location.href = '/login.html';
        return;
    }

    window.addEventListener('popstate', () => {
        const newId = new URLSearchParams(window.location.search).get('id');
        if (newId && newId !== studentId) {
            studentId = newId;
            loadStudentData(studentId);
        }
    });

    function attachReturnHandlers() {
        document.querySelectorAll('.return-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('Подтвердите возврат книги')) return;

                try {
                    const response = await fetch(`/api/loans/${btn.dataset.id}/return`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) throw new Error(await response.text());

                    alert('Книга успешно возвращена');
                    await loadStudentData(studentId); // Перезагружаем данные
                } catch (err) {
                    console.error('Return error:', err);
                    alert(`Ошибка: ${err.message}`);
                }
            });
        });
    }

    function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.padding = '10px';
        errorElement.style.margin = '10px 0';

        // Добавляем перед таблицей
        const table = document.getElementById('loans-table');
        if (table) {
            table.parentNode.insertBefore(errorElement, table);
        } else {
            document.body.prepend(errorElement);
        }

        // Автоматическое скрытие через 5 секунд
        setTimeout(() => errorElement.remove(), 5000);
    }

    // Элементы
    const studentSearch = document.getElementById('student-search');
    const searchStudentBtn = document.getElementById('search-student-btn');
    const backBtn = document.getElementById('back-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Получаем ID студента из URL или из поля поиска
    let studentId = new URLSearchParams(window.location.search).get('id');

    // Если ID не передан в URL, проверяем localStorage
    if (!studentId) {
        studentId = localStorage.getItem('lastViewedStudentId');
    }

    // Форматирование даты
    function formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU');
        } catch (e) {
            console.error('Ошибка форматирования даты:', e);
            return '';
        }
    }
    // Получение текста статуса
    function getStatusText(status) {
        const statuses = {
            'issued': 'На руках',
            'returned': 'Возвращена',
            'overdue': 'Просрочена'
        };
        return statuses[status] || status;
    }

    // Загрузка данных студента и его книг
    // В функции loadStudentData обновим обработку ошибок:
    async function loadStudentData(studentId) {
        console.log('Loading data for student:', studentId);
        if (!studentId) return;

        try {
            // 1. Загрузка данных студента
            const studentRes = await fetch(`/api/students/${studentId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (!studentRes.ok) throw new Error('Student load failed');
            const student = await studentRes.json();
            console.log('Student data:', student);

            // 2. Загрузка книг
            const loansRes = await fetch(`/api/loans/student/${studentId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (!loansRes.ok) throw new Error('Books load failed');
            const loans = await loansRes.json();
            console.log('Loans data:', loans);

            // 3. Обновление UI
            updateStudentUI(student, loans);

        } catch (err) {
            console.error('Ошибка загрузки:', err);
            showError(`Ошибка загрузки данных: ${err.message}`);

            // Сброс данных в интерфейсе
            document.getElementById('student-name').textContent = 'Ошибка загрузки';
            document.getElementById('student-group').textContent = '';
            document.getElementById('student-email').textContent = '';
            document.querySelector('#loans-table tbody').innerHTML =
                '<tr><td colspan="7">Не удалось загрузить данные</td></tr>';
        }
    }

    function updateStudentUI(student, loans) {
        // Обновление основной информации
        document.getElementById('student-name').textContent =
            `${student.last_name} ${student.first_name}`;
        document.getElementById('student-group').textContent = student.group_name;
        document.getElementById('student-email').textContent = student.email;


        // Обновление таблицы с книгами
        const tbody = document.querySelector('#loans-table tbody');
        tbody.innerHTML = loans.length ? loans.map(loan => `
        <tr>
            <td>${loan.book_title || 'N/A'}</td>
            <td>${loan.book_author || 'N/A'}</td>
            <td>${formatDate(loan.loan_date)}</td>
            <td>${formatDate(loan.due_date)}</td>
            <td>${loan.return_date ? formatDate(loan.return_date) : '-'}</td>
            <td>${getStatusText(loan.status)}</td>
            <td>
                ${loan.status === 'issued' ?
                `<button class="return-btn" data-id="${loan.id}">Вернуть</button>` :
                ''}
            </td>
        </tr>
    `).join('') : '<tr><td colspan="7">Нет выданных книг</td></tr>';
        attachReturnHandlers();
    }

    // Возврат книги
    async function returnBook(loanId) {
        if (!confirm('Вы уверены, что хотите вернуть эту книгу?')) return;

        try {
            const response = await fetch(`/api/loans/${loanId}/return`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            await loadStudentData(studentId); // Обновляем данные
            alert('Книга успешно возвращена');
        } catch (err) {
            console.error('Ошибка:', err);
            alert(`Ошибка: ${err.message}`);
        }
    }

    // Кнопка "Назад"
    backBtn.addEventListener('click', () => {
        window.location.href = '/admin/students.html';
    });

    searchStudentBtn.addEventListener('click', handleStudentSearch);

    // Добавьте обработчик нажатия Enter
    studentSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleStudentSearch();
        }
    });

    async function handleStudentSearch() {
        const searchId = studentSearch.value.trim();

        if (!searchId) {
            alert('Введите ID студента');
            return;
        }

        // Проверяем, что ID - число
        if (isNaN(searchId)) {
            alert('ID студента должен быть числом');
            return;
        }

        try {
            // Блокируем кнопку поиска
            searchStudentBtn.disabled = true;
            searchStudentBtn.textContent = 'Поиск...';

            // Проверяем существование студента
            const response = await fetch(`/api/students/${searchId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Студент с таким ID не найден');
                }
                throw new Error('Ошибка сервера');
            }

            // Если студент найден, загружаем его данные
            studentId = searchId;
            await loadStudentData(studentId);
            history.pushState({}, '', `?id=${studentId}`);

            // Очищаем поле поиска
            studentSearch.value = '';
        } catch (err) {
            console.error('Ошибка поиска:', err);
            alert(err.message);
        } finally {
            // Всегда разблокируем кнопку
            searchStudentBtn.disabled = false;
            searchStudentBtn.textContent = 'Найти';
        }
    }
    // Кнопка выхода
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });

    // Инициализация
    await loadStudentData(studentId);
});