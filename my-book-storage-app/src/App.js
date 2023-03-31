import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BookForm from "./components/BookForm";
import BookList from "./components/BookList";
import { addBook } from "./utils/localStorage";
import axios from "axios";

function App() {
  const [books, setBooks] = useState([]);

  const onAddBook = async (book) => {
    try {
      // Call the add-book microservice
      const response = await axios.post("http://localhost:3001/books", book);

      // Add book to state
      setBooks((prevBooks) => [...prevBooks, response.data.book]);

      // Show success message
      alert(response.data.message);
    } catch (error) {
      console.error(error);
      alert("Failed to add book");
    }
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
