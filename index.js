const producer = require("./producer");
const consumer = require("./consumer");
const db = require("./db");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

// Static Files
app.use(express.static("public"));
// Specific folder example
app.use("/css", express.static(__dirname + "public/css"));
app.use("/js", express.static(__dirname + "public/js"));

// Set View's
app.set("views", "./views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/bookshelf", (req, res) => {
  res.sendFile(__dirname + "/views/bookshelf.html");
});

app.get("/modify-booklist-page", (req, res) => {
  res.sendFile(__dirname + "/views/modifyBooklist.html");
});

app.get("/highlighted-books", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM books WHERE category = 'highlight' LIMIT 5"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch highlight books", err);
    res.status(500).json({ error: "Failed to fetch highlight books" });
  }
});

app.post("/api/books", express.json(), async (req, res) => {
  try {
    const book = req.body;
    await producer("addBook", book);
    res.status(201).json({ message: "Book added successfully" });
  } catch (err) {
    console.error("Failed to add book through Kafka", err);
    res.status(500).json({ error: "Failed to add book through Kafka" });
  }
});

app.delete("/api/books/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;
    await producer("deleteBook", isbn);
    res
      .status(200)
      .json({ message: "Book deletion request sent successfully" });
  } catch (err) {
    console.error("Failed to send book deletion request through Kafka", err);
    res
      .status(500)
      .json({ error: "Failed to send book deletion request through Kafka" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

producer("addBook", {
  title: "Example Book",
  author: "John Doe",
  isbn: "1234567890",
});
producer("test", { message: "Hello, KafkaJS!" });
