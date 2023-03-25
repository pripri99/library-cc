const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "library-cc",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

async function send(message) {
  await producer.connect();
  await producer.send({
    topic: "test",
    messages: [{ value: message }],
  });
  await producer.disconnect();
  console.log("Producer sent message:", message);
}

module.exports = send;
