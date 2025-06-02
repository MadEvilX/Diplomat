document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) {
        window.location.href = '/login.html';
        return;
    }

    // Элементы
    const studentSearch = document.getElementById('student-search');
    const searchStudentBtn = document.getElementById('search-student-btn');
    const backBtn = document.getElementById('back-btn');
    const logoutBtn = document.getElementById('logout-btn');

    let studentId = new URLSearchParams(window.location.search).get('id');

    // Загрузка данных студента
    async function loadStudentData() {
        if (!studentId) return;

        try {
            const [studentRes, loansRes] = await Promise.all([
                fetch(`/api/students/${studentId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch(`/api/loans/student/${studentId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            const student = await studentRes.json();
            const loans = await loansRes.json() || []; // Гарантируем массив

            // Обновление UI
            document.getElementById('student-name').textContent =
                `${student.last_name} ${student.first_name}`;
            document.getElementById('student-group').textContent = student.group_name;
            document.getElementById('student-email').textContent = student.email;
            document.getElementById('student-active-loans').textContent =
                loans.filter(loan => loan.status === 'issued').length;

            // Обновление таблицы с книгами
            const tbody = document.querySelector('#loans-table tbody');
            tbody.innerHTML = loans.length ? loans.map(loan => `
            <tr>
                <td>${loan.book_title}</td>
                <td>${loan.book_author}</td>
                <td>${new Date(loan.loan_date).toLocaleDateString()}</td>
                <td>${new Date(loan.due_date).toLocaleDateString()}</td>
                <td>${loan.return_date ? new Date(loan.return_date).toLocaleDateString() : '-'}</td>
                <td>${loan.status === 'issued' ? 'На руках' : 'Возвращена'}</td>
                <td>
                    ${loan.status === 'issued' ?
                    `<button class="librarian-btn librarian-btn-primary librarian-return-btn" data-id="${loan.id}">Вернуть</button>` :
                    ''}
                </td>
            </tr>
        `).join('') : '<tr><td colspan="7">Нет выданных книг</td></tr>';

            // Обработчики для кнопок возврата
            document.querySelectorAll('.librarian-return-btn').forEach(btn => {
                btn.addEventListener('click', () => returnBook(btn.dataset.id));
            });

        } catch (err) {
            console.error('Ошибка загрузки:', err);
            alert('Ошибка загрузки данных студента');
        }
    }

    // Возврат книги
    async function returnBook(loanId) {
        if (!confirm('Подтвердите возврат книги')) return;

        try {
            const response = await fetch(`/api/loans/${loanId}/return`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Ошибка сервера');
            }

            const result = await response.json();
            console.log('Return result:', result);

            alert('Книга успешно возвращена');
            await loadStudentData(); // Перезагружаем данные
        } catch (err) {
            console.error('Ошибка возврата:', err);
            alert(`Ошибка: ${err.message}`);
        }
    }

    // Поиск студента
    searchStudentBtn.addEventListener('click', () => {
        const searchId = studentSearch.value.trim();
        if (searchId) {
            studentId = searchId;
            history.pushState({}, '', `?id=${studentId}`);
            loadStudentData();
        }
    });

    // Навигация
    backBtn.addEventListener('click', () => {
        window.location.href = '/librarian/students.html';
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });

    // Инициализация
    loadStudentData();
});