const { Kafka } = require("kafkajs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const kafka = new Kafka({
  clientId: "observer",
  brokers: ["kafka:9092"], // Update this with your Kafka broker addresses
});

const consumer = kafka.consumer({ groupId: "observer-group" });
const producer = kafka.producer();

const initKafkaConsumer = async () => {
  let totalElapsedTime = 0;
  let totalArrivalTime = 0;
  let totalServiceTime = 0;
  let numJobs = 0;
  let numWorkers = 0;

  await consumer.connect();
  await consumer.subscribe({ topic: "job-results", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const result = JSON.parse(message.value.toString());
      console.log("Job result received:", result);

      // Update the statistics
      const elapsedTime = result.elapsedTime;
      const arrivalTime = Date.now() - result.arrivalTime;
      const serviceTime = elapsedTime - arrivalTime;
      totalElapsedTime += elapsedTime;
      totalArrivalTime += arrivalTime;
      totalServiceTime += serviceTime;
      numJobs++;
      numWorkers = result.numWorkers;

      // Calculate the arrival rate, service rate, and response time
      const arrivalRate = numJobs / (totalArrivalTime / 1000);
      const serviceRate = numJobs / (totalServiceTime / 1000);
      const responseTime = totalElapsedTime / numJobs;

      // Determine the worker action based on the rates
      let workerAction = "nothing";
      if (numWorkers < numJobs && arrivalRate > serviceRate) {
        workerAction = "add";
      } else if (numWorkers > 1 && arrivalRate < serviceRate / 2) {
        workerAction = "remove";
      }

      // Send the observer message to the Kafka topic
      const observerMessage = {
        jobId: result.jobId,
        observerInfo: {
          arrivalRate,
          serviceRate,
          responseTime,
          workerAction,
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
  // Get the observer results from the Kafka topic
  const consumer = kafka.consumer({ groupId: "observer-group" });
  consumer.connect().then(() => {
    consumer
      .subscribe({ topic: "observer-queue", fromBeginning: true })
      .then(() => {
        consumer.run({
          eachMessage: ({ message }) => {
            const observerMessage = JSON.parse(message.value.toString());
            const observerInfo = observerMessage.observerInfo;
            const htmlPath = path.join(__dirname, "public", "observer.html");
            fs.readFile(htmlPath, "utf-8").then((html) => {
              const renderedHtml = html
                .replace("{{jobId}}", observerMessage.jobId)
                .replace("{{arrivalRate}}", observerInfo.arrivalRate.toFixed(2))
                .replace("{{serviceRate}}", observerInfo.serviceRate.toFixed(2))
                .replace(
                  "{{responseTime}}",
                  observerInfo.responseTime.toFixed(2)
                )
                .replace("{{workerAction}}", observerInfo.workerAction);
              res.send(renderedHtml);
            });
          },
        });
      });
  });
});

app.listen(port, async () => {
  console.log(`Observer is running on port ${port}`);
  await initKafkaConsumer();
});
