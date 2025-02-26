async function fetchBooks() {
    const response = await fetch('/books');
    const books = await response.json();
    const booksContainer = document.getElementById('books');
    booksContainer.innerHTML = books.map(book => `
      <div>
        <h3>${book.title}</h3>
        <p>Автор: ${book.author}</p>
        <p>Год: ${book.year}</p>
      </div>
    `).join('');
}

fetchBooks();