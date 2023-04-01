import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BookForm from "./components/BookForm";
import BookList from "./components/BookList";
import axios from "axios";

import keycloak from "./keycloak";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [books, setBooks] = useState([]);

  const API_URL = "http://localhost:3001";

  const onAddBook = async (book) => {
    try {
      // Call the add-book microservice
      const response = await axios.post(`${API_URL}/add-book-requests`, book);

      // Add book to state
      setBooks((prevBooks) => [...prevBooks, book]);

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
            <ProtectedRoute>
              <>
                <BookForm onAddBook={onAddBook} />
                <BookList books={books} />
              </>
            </ProtectedRoute>
          }
        />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

const AppWrapper = () => (
  <ReactKeycloakProvider authClient={keycloak}>
    <App />
  </ReactKeycloakProvider>
);

export default AppWrapper;
