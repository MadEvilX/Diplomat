document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorElement = document.getElementById('error-message');
    const loginButton = loginForm.querySelector('.login-button');
    const buttonText = loginForm.querySelector('.button-text');
    const spinner = loginForm.querySelector('.spinner');
    const togglePassword = document.querySelector('.toggle-password');

    // Переключение видимости пароля
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });

    // Обработка отправки формы
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Валидация
        if (!email || !password) {
            showError('Заполните все поля');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Введите корректный email');
            return;
        }

        try {
            // Показать состояние загрузки
            setLoadingState(true);
            hideError();

            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Неверные учетные данные');
            }

            // Успешный вход
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            redirectUser(data.user.role);

        } catch (err) {
            console.error('Ошибка входа:', err);
            showError(err.message || 'Ошибка при входе в систему');
        } finally {
            setLoadingState(false);
        }
    });

    // Вспомогательные функции
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(message) {
        errorElement.textContent = message;
        errorElement.classList.add('visible');
    }

    function hideError() {
        errorElement.classList.remove('visible');
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            loginButton.disabled = true;
            buttonText.textContent = 'Вход...';
            spinner.classList.remove('hidden');
        } else {
            loginButton.disabled = false;
            buttonText.textContent = 'Войти';
            spinner.classList.add('hidden');
        }
    }

    function redirectUser(role) {
        window.location.href = role === 'admin'
            ? '/admin/dashboard.html'
            : '/librarian/books.html';
    }
});