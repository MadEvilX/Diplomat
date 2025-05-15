document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth() || !['admin', 'librarian'].includes(JSON.parse(localStorage.getItem('user')).role)) {
        window.location.href = '/login.html';
        return;
    }

    const studentId = new URLSearchParams(window.location.search).get('id');
    if (!studentId) {
        window.location.href = '/admin/students.html';
        return;
    }

    // Загрузка данных студента
    async function loadStudentData() {
        try {
            const response = await fetch(`/api/students/${studentId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();

            document.getElementById('student-name').textContent =
                `${data.last_name} ${data.first_name}`;
            document.getElementById('student-group').textContent = data.group_name;
            document.getElementById('student-email').textContent = data.email;

            // Отображение книг
            const loansTable = document.getElementById('loans-table').querySelector('tbody');
            loansTable.innerHTML = data.loans.map(loan => `
                <tr>
                    <td>${loan.book_title || 'Неизвестно'}</td>
                    <td>${loan.book_author || 'Неизвестно'}</td>
                    <td>${new Date(loan.loan_date).toLocaleDateString()}</td>
                    <td>${getStatusText(loan.status)}</td>
                    <td>
                        ${loan.status === 'issued' ?
                    '<button class="btn-primary return-btn" data-id="${loan.id}">Вернуть</button>' :
                    ''}
                    </td>
                </tr>
            `).join('');

            // Обработчики для кнопок возврата
            document.querySelectorAll('.return-btn').forEach(btn => {
                btn.addEventListener('click', () => returnBook(btn.dataset.id));
            });

        } catch (err) {
            console.error('Ошибка загрузки данных:', err);
        }
    }

    function getStatusText(status) {
        const statuses = {
            'issued': 'На руках',
            'returned': 'Возвращена',
            'overdue': 'Просрочена'
        };
        return statuses[status] || status;
    }

    async function returnBook(loanId) {
        if (!confirm('Подтвердить возврат книги?')) return;

        try {
            const response = await fetch(`/api/loans/${loanId}/return`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.ok) {
                await loadStudentData(); // Обновляем данные
                alert('Книга успешно возвращена');
            } else {
                throw new Error(await response.text());
            }
        } catch (err) {
            console.error('Ошибка:', err);
            alert(`Ошибка: ${err.message}`);
        }
    }

    // Кнопка "Назад"
    document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = '/admin/students.html';
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });

    // Инициализация
    await loadStudentData();
});