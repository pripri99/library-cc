const express = require("express");
const cors = require("cors");
const {
  producer,
  initKafkaProducer,
  initKafkaConsumer,
} = require("./kafkaClient");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Kafka producer and consumer
initKafkaProducer();
initKafkaConsumer();

// POST /jobs
app.post("/jobs", async (req, res) => {
  const job = req.body;

  // Send the job to the Kafka topic
  await producer.send({
    topic: "job-queue",
    messages: [{ value: JSON.stringify(job) }],
  });

  res.status(201).json({ jobId: job.id, success: true }); // Add the success property
  console.log("Job Posted to job queue in server");
});

// GET /jobs/:jobId/status
app.get("/jobs/:jobId/status", (req, res) => {
  const jobId = parseInt(req.params.jobId);
  const job = jobs[jobId];

  if (job) {
    res.json({ status: "completed" });
  } else {
    res.status(404).json({ message: "Job not found" });
  }
});

// GET /jobs/:jobId/result
app.get("/jobs/:jobId/result", (req, res) => {
  const jobId = parseInt(req.params.jobId);
  const job = jobs[jobId];

  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ message: "Job not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
