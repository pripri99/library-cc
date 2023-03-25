const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "library-cc",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "test-group" });

async function start() {
  await consumer.connect();
  await consumer.subscribe({ topic: "test", fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("Consumer received message:", {
        value: message.value.toString(),
      });
    },
  });
}

start().catch(console.error);

module.exports = consumer;
