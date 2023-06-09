const { Kafka } = require("kafkajs");
const db = require("./db");
const {
  lpushAsync,
  lrangeAsync,
  connect,
  disconnect,
} = require("./redisClient");

// Initialize Kafka consumer
const kafka = new Kafka({
  clientId: "deleteBookService",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "delete-book-group" });

async function logReceivedMessage(topic, message) {
  await connect();
  await lpushAsync(
    `receivedMessages:${topic}`,
    JSON.stringify({ message, timestamp: new Date() })
  );
  await disconnect();
}

async function getReceivedMessages(topic) {
  const messages = await lrangeAsync(`receivedMessages:${topic}`, 0, -1);
  return messages.map((message) => JSON.parse(message));
}

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
        // Retrieve book from the database
        const result = await db.query(
          "SELECT title FROM books WHERE isbn = $1",
          [isbn]
        );
        const book = result.rows[0];

        // Delete book from the database
        await db.query("DELETE FROM books WHERE isbn = $1", [isbn]);
        console.log(
          `Book ${book.title} with ISBN ${isbn} deleted from the database`
        );
        await logReceivedMessage(
          topic,
          `Book ${book.title} with ISBN ${isbn} deleted from the database`
        );
      } catch (err) {
        console.error("Failed to delete book from the database", err);
      }
    },
  });
};

run().catch(console.error);
