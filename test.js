const bcrypt = require('bcrypt');
const { pool } = require('./db');

async function createUser(email, plainPassword, role) {
    try {
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        await pool.query(
            `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
            [email, hashedPassword, role]
        );

        console.log(`👤 Пользователь ${email} создан`);
    } catch (err) {
        console.error(`❌ Ошибка создания пользователя ${email}:`, err.message);
    }
}

// Основная функция
(async () => {
    await createUser('admin@lib.ru', 'secureAdmin123', 'admin');
    await createUser('librarian@lib.ru', 'libSecure456', 'librarian');

    pool.end();
})();