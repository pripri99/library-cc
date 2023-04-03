const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "my-server",
  brokers: ["kafka:9092"], // Update this with your Kafka broker addresses
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "my-server-group" });

const initKafkaProducer = async () => {
  await producer.connect();
};

const initKafkaConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "job-results", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const result = JSON.parse(message.value.toString());
      console.log("Job result received:", result);
      // TODO: Handle the job result (e.g., store it in a database or in-memory cache)
    },
  });
};

module.exports = { producer, initKafkaProducer, initKafkaConsumer };
