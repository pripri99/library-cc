const { Kafka } = require("kafkajs");
const db = require("../../db");

// Initialize Kafka consumer
const kafka = new Kafka({
  clientId: "deleteBookService",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "delete-book-group" });

const run = async () => {
  // Connect to Kafka
  await consumer.connect();

  // Subscribe to the topic 'deleteBook'
  await consumer.subscribe({ topic: "deleteBook", fromBeginning: true });

  // Process messages
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const isbn = message.value.toString();
      try {
        // Delete book from the database
        await db.query("DELETE FROM books WHERE isbn = $1", [isbn]);
        console.log(`Book with ISBN ${isbn} deleted from the database`);
      } catch (err) {
        console.error("Failed to delete book from the database", err);
      }
    },
  });
};

run().catch(console.error);
