import React, { useState, useEffect } from "react";
import Book from "./Book";

const BookList = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Load books from local storage
    const storedBooks = JSON.parse(localStorage.getItem("books")) || [];
    setBooks(storedBooks);
  }, []);

  const handleDelete = (isbn) => {
    // Remove book from local storage
    const updatedBooks = books.filter((book) => book.isbn !== isbn);
    localStorage.setItem("books", JSON.stringify(updatedBooks));

    // Update state
    setBooks(updatedBooks);
  };

  return (
    <div className="container">
      <h1 className="display-4 text-center">
        <i className="fas fa-book-open text-primary"></i> My
        <span className="text-primary">Book</span>List
      </h1>
      <table className="table table-striped mt-5">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>ISBN#</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <Book key={book.isbn} book={book} onDelete={handleDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookList;
