require("dotenv").config();
const producer = require("./producer");
const consumer = require("./consumer");
const path = require("path");
const db = require("./db");
const express = require("express");
const { redisClient } = require("./redisClient");
const cors = require("cors");

const app = express();
// Enable CORS middleware
app.use(cors());
const port = process.env.PORT || 3001;

consumer.consumeMessage("addBook");
consumer.consumeMessage("deleteBook");

app.use(
  cors({
    origin: ["http://localhost:3001"], // Replace with the origins you want to allow
  })
);

// Static Files
app.use(express.static("public"));
// Specific folder example
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/js", express.static(path.join(__dirname, "public/js")));

// Set View's
app.set("views", "./views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/bookshelf", (req, res) => {
  res.sendFile(__dirname + "/views/bookshelf.html");
});

app.get("/modify-booklist", (req, res) => {
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

app.get("/api/books", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books");
    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch books", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

app.get("/api/kafka-logs/:topic", async (req, res) => {
  const topic = req.params.topic;
  const sentMessages = await producer.getSentMessages(topic);
  const receivedMessages = await consumer.getReceivedMessages(topic);
  res.json({ sentMessages, receivedMessages });
});
redisClient.connect().catch((err) => {
  console.error("Failed to connect to Redis:", err);
  process.exit(1);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

producer.send("test", { message: "Hello, KafkaJS!" });

process.on("SIGINT", async () => {
  await redisClient.disconnect();
  process.exit(0);
});
