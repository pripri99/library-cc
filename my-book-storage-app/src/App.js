import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import BookForm from "./components/BookForm";
import BookList from "./components/BookList";
import axios from "axios";

const App = () => {
  const { keycloak, initialized } = useKeycloak();
  const [books, setBooks] = useState([]);
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

      // Add book to state
      setBooks((prevBooks) => [...prevBooks, book]);

      // Show success message
      alert(response.data.message);
    } catch (error) {
      console.error(error);
      alert("Failed to add book");
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
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h2>Welcome, {keycloak.tokenParsed.name}!</h2>
              <button onClick={fetchProtectedResource}>
                Fetch Unknown Protected Resource
              </button>
              <button onClick={() => keycloak.logout()}>Logout</button>
              <BookForm onAddBook={onAddBook} />
              <BookList books={books} />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
