const { Kafka } = require("kafkajs");
const { lpushAsync, lrangeAsync } = require("./redisClient");

const kafka = new Kafka({
  clientId: "library-cc",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

async function send(topic, message) {
  await producer.connect();
  await producer.send({
    topic: topic,
    messages: [{ value: JSON.stringify(message) }],
  });
  await redisClient.connect();
  await logSentMessage(topic, message);
  await redisClient.disconnect();
  await producer.disconnect();
  console.log("Producer sent message to topic", topic, ":", message);
}

async function logSentMessage(topic, message) {
  await lpushAsync(
    `sentMessages:${topic}`,
    JSON.stringify({ message, timestamp: new Date() })
  );
}

async function getSentMessages(topic) {
  const messages = await lrangeAsync(`sentMessages:${topic}`, 0, -1);
  return messages.map((message) => JSON.parse(message));
}

module.exports = { send, getSentMessages };
