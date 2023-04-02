const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { Kafka } = require("kafkajs");
const session = require("express-session");
const Keycloak = require("keycloak-connect");

const app = express();
const memoryStore = new session.MemoryStore();

// Configure express-session
app.use(
  session({
    secret: "your-session-secret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

// Configure Keycloak
const keycloak = new Keycloak({ store: memoryStore });

// Use Keycloak middleware to protect routes
app.use(keycloak.middleware());

// Use cors and bodyParser middleware
app.use(cors());
app.use(bodyParser.json());

// Create a pool of Postgres clients to handle database connections
const pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "db",
  port: 5432,
  database: "books",
  ssl: false,
});

// Create the books table if it does not exist
async function createBooksTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        isbn TEXT NOT NULL UNIQUE
      );
    `);
    console.log("Created books table");
  } catch (error) {
    console.error("Error creating books table:", error);
  } finally {
    client.release();
  }
}

// Call the createBooksTable function when the application starts
createBooksTable();

// Create a Kafka consumer to receive add-book-requests messages from the queue
const kafka = new Kafka({
  clientId: "add-book-service",
  brokers: ["kafka:9092"],
});
const consumer = kafka.consumer({ groupId: "add-book-service-group" });

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: "add-book-requests" });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const { title, author, isbn } = JSON.parse(message.value.toString());

      try {
        // Use a Postgres client from the pool to execute an INSERT query
        const client = await pool.connect();
        const result = await client.query(
          "INSERT INTO books (title, author, isbn) VALUES ($1, $2, $3) ON CONFLICT (isbn) DO UPDATE SET title = excluded.title, author = excluded.author RETURNING *",
          [title, author, isbn]
        );
        const addedBook = result.rows[0];
        client.release();

        console.log("Added book:", addedBook);
      } catch (error) {
        console.error(error);
      }
    },
  });
}

startConsumer().catch((error) => {
  console.error("Error starting consumer:", error);
});

const PORT = process.env.PORT || 3001;

app.post("/add-book-requests", keycloak.protect(), async (req, res) => {
  console.log(req.body); // log the request body to the console
  const { title, author, isbn } = req.body;

  // Send the book to the Kafka queue
  const producer = kafka.producer();
  await producer.connect();

  await producer.send({
    topic: "add-book-requests",
    messages: [{ value: JSON.stringify({ title, author, isbn }) }],
  });

  await producer.disconnect();

  res.status(200).json({ message: "Book request queued" });
});

app.listen(PORT, () => {
  console.log(`Book service is running on port ${PORT}`);
});
