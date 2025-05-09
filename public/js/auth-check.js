// /js/auth-check.js (новый файл)

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token) {
        redirectToLogin();
        return false;
    }

    // Проверка срока действия токена
    if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        redirectToLogin();
        return false;
    }

    return true;
}

function isTokenExpired(token) {
    try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        return decoded.exp < Date.now() / 1000;
    } catch {
        return true;
    }
}

function redirectToLogin() {
    const returnUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `/login.html?returnUrl=${returnUrl}`;
}

// Проверка при загрузке страницы
if (!window.location.pathname.includes('/login.html')) {
    checkAuth();
}