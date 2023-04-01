import React, { useState } from "react";

const BookForm = ({ onAddBook }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validate
    if (title === "" || author === "" || isbn === "") {
      alert("Please fill in all fields");
    } else {
      // Instantiate book
      const book = {
        title,
        author,
        isbn,
      };
      // Call onAddBook prop to add book to state and local storage
      onAddBook(book);

      // Show success message
      //alert("Book Added");

      // Clear fields
      setTitle("");
      setAuthor("");
      setIsbn("");
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="display-4 text-center">
        <i className="fas fa-book-open text-primary"></i> My
        <span className="text-primary">Book</span>List
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
