import React, { useState } from "react";
import axios from "axios";

const BookForm = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { data } = await axios.post(
      "http://localhost:3000/api/books",
      {
        title,
        author,
        isbn,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    console.log(data);
  };

  return (
    <div className="container mt-4">
      <h1 className="display-4 text-center">
        <i className="fas fa-book-open text-primary"></i> My
        <span className="text-primary">Book</span>
        List
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="author">Author</label>
          <input
            type="text"
            id="author"
            className="form-control"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="isbn">ISBN#</label>
          <input
            type="text"
            id="isbn"
            className="form-control"
            value={isbn}
            onChange={(event) => setIsbn(event.target.value)}
          />
        </div>
        <input
          type="submit"
          value="Add Book"
          className="btn btn-primary btn-block"
        />
      </form>
    </div>
  );
};

export default BookForm;
