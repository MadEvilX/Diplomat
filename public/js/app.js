// Единая точка входа
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadData();
});

// Проверка авторизации
function checkAuth() {
  if (window.location.pathname.includes('/login.html')) return;

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token) {
    window.location.href = '/login.html';
    return false;
  }

  // Проверка роли для админ-зоны
  if (window.location.pathname.includes('/admin/') && user?.role !== 'admin') {
    alert('Доступ запрещён!');
    window.location.href = '/login.html';
    return false;
  }

  return true;
}

// Загрузка данных (универсальная)
async function loadData() {
  if (document.getElementById('total-books')) {
    await loadDashboardStats();
  }

  if (document.getElementById('books-table')) {
    await loadBooks();
  }

  if (document.getElementById('users-list')) {
    await loadUsers();
  }
}

async function loadDashboardStats() {
  try {
    const response = await fetch('/api/stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();

    document.getElementById('total-books').textContent = data.books;
    document.getElementById('total-users').textContent = data.users;
  } catch (err) {
    console.error('[STATS ERROR]', err);
  }
}

async function loadBooks() {
  try {
    const response = await fetch('/api/books', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const books = await response.json();

    const tbody = document.querySelector('#books-table tbody');
    if (tbody) {
      tbody.innerHTML = books.map(book => `
        <tr>
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.year}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('[BOOKS ERROR]', err);
  }
}

async function loadUsers() {
  try {
    const response = await fetch('/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const users = await response.json();

    const list = document.getElementById('users-list');
    if (list) {
      list.innerHTML = users.map(user => `
        <li>${user.name} - ${user.email} (${user.role})</li>
      `).join('');
    }
  } catch (err) {
    console.error('[USERS ERROR]', err);
  }
}