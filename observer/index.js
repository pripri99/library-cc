const { Kafka } = require("kafkajs");
const fs = require("fs").promises;
const path = require("path");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const kafka = new Kafka({
  clientId: "observer",
  brokers: ["kafka:9092"],
});

const producer = kafka.producer();

const getObserverResults = async (jobId) => {
  const consumer = kafka.consumer({ groupId: "observer-group" });
  await consumer.connect();
  await consumer.subscribe({ topic: "observer-queue", fromBeginning: true });

  return new Promise((resolve) => {
    consumer.run({
      eachMessage: async ({ message }) => {
        const observerMessage = JSON.parse(message.value.toString());
        if (observerMessage.jobId === jobId) {
          const observerInfo = observerMessage.observerInfo;
          const htmlPath = path.join(__dirname, "public", "observer.html");
          const html = await fs.readFile(htmlPath, "utf-8");
          const renderedHtml = html
            .replace("{{jobId}}", observerMessage.jobId)
            .replace("{{arrivalRate}}", observerInfo.arrivalRate.toFixed(2))
            .replace("{{serviceRate}}", observerInfo.serviceRate.toFixed(2))
            .replace("{{responseTime}}", observerInfo.responseTime.toFixed(2))
            .replace("{{workerAction}}", observerInfo.workerAction);
          resolve(renderedHtml);
        }
      },
    });
  });
};

app.get("/", (req, res) => {
  const jobId = req.query.jobId;

  if (!jobId) {
    res.status(400).send("Missing jobId parameter");
    return;
  }

  getObserverResults(jobId)
    .then((html) => {
      res.send(html);
    })
    .catch((err) => {
      console.error("Error getting observer results:", err);
      res.status(500).send("Error getting observer results");
    });
});

app.listen(port, () => {
  console.log(`Observer is running on port ${port}`);
});
