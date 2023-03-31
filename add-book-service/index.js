const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post("/books", (req, res) => {
  const book = req.body;

  // Add book to the database
  // ...

  res.status(201).json({ message: "Book added", book });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Book service is running on port ${PORT}`);
});
