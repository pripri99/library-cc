import React from "react";
import Book from "./Book";

const BookList = ({ books, onDeleteBook }) => {
  const handleDelete = (isbn) => {
    onDeleteBook(isbn);
  };

  return (
    <div className="container">
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
            <Book key={book.isbn} book={book} onDeleteBook={handleDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookList;
