const { Kafka } = require("kafkajs");

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
  await producer.disconnect();
  console.log("Producer sent message to topic", topic, ":", message);
}

module.exports = send;
