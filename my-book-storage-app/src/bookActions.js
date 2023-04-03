import { sendJob } from "./api";
import CryptoJS from "crypto-js";

export const onAddBook = async (
  book,
  keycloak,
  setBooks,
  saveBooksToLocalStorage
) => {
  try {
    console.log(
      "REACT_APP_ENCRYPTION_KEY:",
      process.env.REACT_APP_ENCRYPTION_KEY
    );
    const encryptedCredentials = CryptoJS.AES.encrypt(
      JSON.stringify({
        // Your actual database credentials
        user: "postgres",
        password: "postgres",
        host: "localhost",
        port: "5432",
        database: "books",
      }),
      process.env.REACT_APP_ENCRYPTION_KEY
    ).toString();

    const job = {
      id: Date.now(),
      type: "AddBook",
      GIT_REPO: "https://github.com/pripri99/book-app-main.git",
      data_source_links: [],
      data: book,
      data_sink_links: [],
      credentials: encryptedCredentials,
    };

    // Send job to the REST server
    const response = await sendJob(job, keycloak.token);
    console.log(response);

    if (response.success) {
      // Add book to state
      setBooks((prevBooks) => {
        const updatedBooks = [...prevBooks, book];
        saveBooksToLocalStorage(updatedBooks);
        return updatedBooks;
      });

      // Show success message
      alert(`Job ${response.jobId} added to queue`);
    } else {
      console.log(response);
      throw new Error("Failed to add book");
    }
  } catch (error) {
    console.error(error);
    alert("Failed to add book");
  }
};
