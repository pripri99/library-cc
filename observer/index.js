const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "observer-service",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "observer-group" });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "job-deletions", fromBeginning: true });

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const jobId = message.key.toString();
      const jobData = JSON.parse(message.value.toString());

      // Implement your logic for handling job deletions here
      console.log(`Job deleted: ${jobId}`);
    },
  });
};

run().catch(console.error);
