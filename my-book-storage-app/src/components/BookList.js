import React from "react";
import Book from "./Book";
import { removeBook } from "../utils/localStorage";

const BookList = ({ books }) => {
  const handleDelete = (isbn) => {
    // Remove book from local storage
    removeBook(isbn);
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
            <Book key={book.isbn} book={book} onDelete={handleDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookList;
