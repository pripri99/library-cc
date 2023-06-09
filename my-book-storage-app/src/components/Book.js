import React from "react";

const Book = ({ book, onDeleteBook }) => {
  const { title, author, isbn } = book;

  const handleDelete = () => {
    onDeleteBook(isbn);
  };

  return (
    <tr>
      <td>{title}</td>
      <td>{author}</td>
      <td>{isbn}</td>
      <td>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>
          X
        </button>
      </td>
    </tr>
  );
};

export default Book;
