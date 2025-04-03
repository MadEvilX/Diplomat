// public/app.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('Страница загружена!');

  // Пример запроса к API
  fetch('/books')
    .then(response => response.json())
    .then(data => {
      console.log('Список книг:', data);
    })
    .catch(error => {
      console.error('Ошибка при загрузке книг:', error);
    });
});

// public/app.js (дополнение)
document.addEventListener('DOMContentLoaded', () => {
  const booksList = document.getElementById('books-list');

  // Загрузка списка книг
  fetch('/books')
    .then(response => response.json())
    .then(books => {
      books.forEach(book => {
        const li = document.createElement('li');
        li.textContent = `${book.title} - ${book.author} (${book.year})`;
        booksList.appendChild(li);
      });
    })
    .catch(error => {
      console.error('Ошибка при загрузке книг:', error);
    });
});

// public/app.js (дополнение)
document.addEventListener('DOMContentLoaded', () => {
  const usersList = document.getElementById('users-list');

  // Загрузка списка пользователей
  fetch('/users')
    .then(response => response.json())
    .then(users => {
      users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.name} - ${user.email} (${user.role})`;
        usersList.appendChild(li);
      });
    })
    .catch(error => {
      console.error('Ошибка при загрузке пользователей:', error);
    });
});

fetch('/users')
  .then(response => {
    console.log('Ответ от сервера:', response);
    return response.json();
  })
  .then(users => {
    console.log('Данные пользователей:', users);
    // ...
  })
  .catch(error => {
    console.error('Ошибка:', error);
  });

document.addEventListener('DOMContentLoaded', () => {
  const usersList = document.getElementById('users-list');

  // Очищаем список перед загрузкой
  usersList.innerHTML = '';

  fetch('/users')
    .then(response => response.json())
    .then(users => {
      usersList.innerHTML = ''; // Убираем индикатор загрузки
      users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.name} - ${user.email} (${user.role})`;
        usersList.appendChild(li);
      });
    })
    .catch(error => {
      usersList.innerHTML = '<li>Ошибка при загрузке данных</li>';
      console.error('Ошибка при загрузке пользователей:', error);
    });

});

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: document.getElementById('email').value,
          password: document.getElementById('password').value
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка сервера');
      }

      localStorage.setItem('token', data.token);
      window.location.href = data.user.role === 'admin'
        ? '/admin/dashboard.html'
        : '/librarian/books.html';

    } catch (err) {
      console.error('Ошибка входа:', err);
      alert(err.message);
    }
  });
});