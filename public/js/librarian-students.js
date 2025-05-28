document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) {
        window.location.href = '/login.html';
        return;
    }

    // Элементы
    const studentsTable = document.getElementById('students-table').querySelector('tbody');
    const searchInput = document.getElementById('student-search');
    const searchBtn = document.getElementById('student-search-btn');
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
            studentsTable.innerHTML = '<tr><td colspan="6">Ошибка загрузки данных</td></tr>';
        }
    }

    // Отображение студентов
    function renderStudents(students = allStudents) {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredStudents = students.filter(student =>
            `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm)
        );

        studentsTable.innerHTML = filteredStudents.map(student => `
            <tr>
                <td>${student.id}</td>
                <td>${student.last_name} ${student.first_name}</td>
                <td>${student.group_name}</td>
                <td>${student.email}</td>
                <td>${student.active_loans || 0}</td>
                <td>
                    <a href="/librarian/student-details.html?id=${student.id}" class="librarian-btn librarian-btn-primary">Подробнее</a>
                </td>
            </tr>
        `).join('');
    }

    // Поиск студентов
    searchBtn.addEventListener('click', renderStudents);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') renderStudents();
    });

    // Выход из системы
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });

    // Инициализация
    loadStudents();
});