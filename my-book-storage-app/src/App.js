import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import BookForm from "./components/BookForm";
import BookList from "./components/BookList";
import Sidebar from "./components/Sidebar";
import axios from "axios";
import {
  saveBooksToLocalStorage,
  getBooksFromLocalStorage,
} from "./utils/localStorage";

const App = () => {
  const { keycloak, initialized } = useKeycloak();
  const [books, setBooks] = useState([]);
  const [jobIds, setJobIds] = useState([]);

  useEffect(() => {
    setBooks(getBooksFromLocalStorage());
  }, []);

  const onDeleteBook = (isbn) => {
    const updatedBooks = books.filter((book) => book.isbn !== isbn);
    setBooks(updatedBooks);
    saveBooksToLocalStorage(updatedBooks);
  };

  const onAddBook = async (book) => {
    try {
      // Call the add-book microservice
      const response = await axios.post(
        "http://localhost:3001/add-book-requests",
        book,
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        }
      );

      // Save the job ID in state
      setJobIds((prevJobIds) => {
        const updatedJobIds = [...prevJobIds, response.data.jobId];
        return updatedJobIds;
      });

      // Add book to state
      setBooks((prevBooks) => {
        const updatedBooks = [...prevBooks, book];
        saveBooksToLocalStorage(updatedBooks);
        return updatedBooks;
      });

      // Show success message
      alert(response.data.message);
    } catch (error) {
      console.error(error);
      alert("Failed to add book ");
    }
  };

  const fetchProtectedResource = async () => {
    try {
      const response = await axios.get(
        "http://your-rest-server-url/protected",
        {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!initialized) {
    return <div>Loading...</div>;
  }

  if (!keycloak.authenticated) {
    return (
      <div>
        <button onClick={() => keycloak.login()}>Login</button>
        <button onClick={() => keycloak.login({ action: "register" })}>
          Sign Up
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="container-fluid">
        <div className="app-container row">
          <Sidebar
            keycloak={keycloak}
            fetchProtectedResource={fetchProtectedResource}
          />
          <div className="content-container col">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <BookForm onAddBook={onAddBook} />
                    <BookList books={books} onDeleteBook={onDeleteBook} />
                  </>
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
