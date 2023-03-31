const { Kafka } = require("kafkajs");
const {
  lpushAsync,
  lrangeAsync,
  connect,
  disconnect,
} = require("./redisClient");

const kafka = new Kafka({
  clientId: "library-cc",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "test-group" });

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

async function consumeMessage() {
  await consumer.connect();
  await consumer.subscribe({ topic: "test", fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("Consumer received message:", {
        value: message.value.toString(),
      });
      await logReceivedMessage(topic, message.value.toString());
    },
  });
}

consumeMessage().catch(console.error);

module.exports = { consumeMessage, getReceivedMessages };
