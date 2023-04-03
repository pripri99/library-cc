const { Kafka } = require("kafkajs");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const kafka = new Kafka({
  clientId: "observer",
  brokers: ["kafka:9092"], // Update this with your Kafka broker addresses
});

const consumer = kafka.consumer({ groupId: "observer-group" });
const producer = kafka.producer();

const initKafkaConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "job-results", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const result = JSON.parse(message.value.toString());
      console.log("Job result received:", result);

      // Perform the algorithm to determine the info
      // Average rate of arrival
      // Average rate of service
      // Average response time
      // Add/remove/nothing worker decision

      // Send the observer message to the Kafka topic
      const observerMessage = {
        jobId: result.jobId,
        observerInfo: {
          arrivalRate: 10, // Replace with the actual arrival rate
          serviceRate: 8, // Replace with the actual service rate
          responseTime: 2, // Replace with the actual response time
          workerAction: "add", // Replace with the actual worker action
        },
      };

      await producer.send({
        topic: "observer-queue",
        messages: [{ value: JSON.stringify(observerMessage) }],
      });

      console.log("Observer message sent:", observerMessage);
    },
  });
};

app.get("/observer", (req, res) => {
  // Implement the page to display the observer results in a table or a graph
});

app.listen(port, async () => {
  console.log(`Observer is running on port ${port}`);
  await initKafkaConsumer();
});
