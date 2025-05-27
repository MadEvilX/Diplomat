const validateBook = (bookData) => {
  const errors = [];

  if (!bookData.title || bookData.title.trim().length < 2) {
    errors.push('Название книги должно содержать минимум 2 символа');
  }

  if (!bookData.author || bookData.author.trim().length < 2) {
    errors.push('Укажите автора (минимум 2 символа)');
  }

  const currentYear = new Date().getFullYear();
  if (year && (year < 1800 || year > currentYear + 5)) { // +5 лет в будущее
    return res.status(400).json({
      message: `Год должен быть между 1800 и ${currentYear + 5}`
    });
  }

  if (!bookData.quantity || bookData.quantity < 0) {
    errors.push('Количество книг не может быть отрицательным');
  }

  return errors;
};

const validateUser = (userData) => {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!userData.name || userData.name.trim().length < 2) {
    errors.push('Имя должно содержать минимум 2 символа');
  }

  if (!userData.email || !emailRegex.test(userData.email)) {
    errors.push('Укажите корректный email');
  }

  if (!userData.role || !['admin', 'librarian'].includes(userData.role)) {
    errors.push('Укажите роль: admin или librarian');
  }

  if (userData.password && userData.password.length < 6) {
    errors.push('Пароль должен содержать минимум 6 символов');
  }

  return errors;
};

const validateLoan = (loanData) => {
  const errors = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!loanData.book_id || isNaN(loanData.book_id)) {
    errors.push('Укажите ID книги');
  }

  if (!loanData.user_id || isNaN(loanData.user_id)) {
    errors.push('Укажите ID пользователя');
  }

  const dueDate = new Date(loanData.due_date);
  if (!loanData.due_date || dueDate < today) {
    errors.push('Дата возврата должна быть в будущем');
  }

  return errors;
};

module.exports = { validateBook, validateUser, validateLoan };