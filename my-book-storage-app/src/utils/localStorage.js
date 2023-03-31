class Book {
  constructor(title, author, isbn) {
    this.title = title;
    this.author = author;
    this.isbn = isbn;
  }
}

const getBooks = () => {
  const storedBooks = JSON.parse(localStorage.getItem("books")) || [];
  return storedBooks.map(
    ({ title, author, isbn }) => new Book(title, author, isbn)
  );
};

const addBook = (book) => {
  const storedBooks = JSON.parse(localStorage.getItem("books")) || [];
  storedBooks.push(book);
  localStorage.setItem("books", JSON.stringify(storedBooks));
};

const removeBook = (isbn) => {
  const storedBooks = JSON.parse(localStorage.getItem("books")) || [];
  const updatedBooks = storedBooks.filter((book) => book.isbn !== isbn);
  localStorage.setItem("books", JSON.stringify(updatedBooks));
};

export { Book, getBooks, addBook, removeBook };
