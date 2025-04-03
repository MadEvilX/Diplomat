const bcrypt = require('bcryptjs');
const hash = '$2b$10$4UccdVpSuXcJoAEw1ZqxYe6fHpTY/J4UAOqnPDxC9y2Y66/3z6qLm'; // Ваш новый хеш

(async () => {
    console.log('Сравнение пароля:', await bcrypt.compare('admin123', hash));
})();