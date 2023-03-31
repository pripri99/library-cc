import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BookForm from "./components/BookForm";
import BookList from "./components/BookList";
import { addBook } from "./utils/localStorage";

function App() {
  const [books, setBooks] = useState([]);

  const onAddBook = (book) => {
    // Add book to state
    setBooks((prevBooks) => [...prevBooks, book]);

    // Add book to local storage
    addBook(book);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <BookForm onAddBook={onAddBook} />
              <BookList books={books} />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
