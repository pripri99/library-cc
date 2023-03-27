const { Kafka } = require("kafkajs");
const db = require("../../db");
const { addBookToDatabaseFromISBN } = require("../../addBooksToDatabase");

// Initialize Kafka consumer
const kafka = new Kafka({
  clientId: "addBookService",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "book-group" });

const run = async () => {
  // Connect to Kafka
  await consumer.connect();

  // Subscribe to the topic 'addBook'
  await consumer.subscribe({ topic: "addBook", fromBeginning: true });

  // Process messages
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const book = JSON.parse(message.value.toString());
      try {
        // Save book to the database
        /*await db.query(
          "INSERT INTO books (title, author, isbn) VALUES ($1, $2, $3) ON CONFLICT (isbn) DO UPDATE SET title = EXCLUDED.title, author = EXCLUDED.author",
          [book.title, book.author, book.isbn]
        );*/
        addBookToDatabaseFromISBN(book.isbn);
        console.log(`Book added to the database: ${JSON.stringify(book)}`);
      } catch (err) {
        if (err.code === "23505") {
          try {
            await db.query(
              "UPDATE books SET title = $1, author = $2 WHERE isbn = $3",
              [book.title, book.author, book.isbn]
            );
            console.log(
              `Book overwritten in the database: ${JSON.stringify(book)}`
            );
          } catch (err) {
            console.error("Failed to update book in the database", err);
          }
        } else {
          console.error("Failed to add book to the database", err);
        }
      }
    },
  });
};

run().catch(console.error);
