const express = require("express");
const app = express();
app.post("/api/books", (req, res) => {
  // Code to add a new book to the API
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
