const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Kafka } = require("kafkajs");
const { KafkaStreams } = require("node-kafka-streams");
const { Pool } = require("pg");

const kafka = new Kafka({
  clientId: "job-api",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
const kafkaStreams = new KafkaStreams({
  noptions: {
    "metadata.broker.list": "localhost:9092",
    "group.id": "job-api-group",
    "socket.keepalive.enable": true,
    "enable.auto.commit": false,
  },
  tconf: {
    "auto.offset.reset": "earliest",
  },
});

const pool = new Pool({
  // PostgreSQL connection config
});

(async () => {
  const stream = kafkaStreams.getKStream("job-status-updates");
  stream
    .mapJSONConvenience()
    .forEach(async (message) => {
      const { jobId, status, result } = message.value;
      const createdAt = new Date();
      await pool.query(
        "INSERT INTO job_statuses (job_id, status, result, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (job_id) DO UPDATE SET status = EXCLUDED.status, result = EXCLUDED.result, created_at = EXCLUDED.created_at",
        [jobId, status, result, createdAt]
      );
    })
    .commit();

  await stream.start();
})();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3002 });

function sendJobUpdate(ws, message) {
  ws.send(JSON.stringify(message.value));
}

wss.on("connection", (ws) => {
  // Implement logic for WebSocket connection and handling job updates
  // Goal: Subscribe to changes in jobs via websockets
  console.log("WebSocket client connected");

  const consumerGroupId = `job-api-ws-group-${Date.now()}`; // Unique group id
  const wsConsumer = kafka.consumer({ groupId: consumerGroupId });

  (async () => {
    await wsConsumer.connect();
    await wsConsumer.subscribe({ topic: "job-status-updates" });

    wsConsumer.run({
      eachMessage: async ({ message }) => {
        const jobUpdate = JSON.parse(message.value.toString());
        sendJobUpdate(ws, jobUpdate);
      },
    });
  })();

  ws.on("close", async () => {
    console.log("WebSocket client disconnected");
    await wsConsumer.disconnect();
  });
});

app.post("/jobs", async (req, res) => {
  const jobData = req.body;
  const token = req.headers.authorization.split(" ")[1]; // Extract bearer token

  // Generate a unique job ID
  const jobId = `job-${Date.now()}`;

  // Create a Kafka message with the job data and token
  const message = {
    key: jobId,
    value: JSON.stringify({ ...jobData, token }),
  };

  // Send the message to the Kafka topic
  await producer.connect();
  await producer.send({
    topic: "job-requests",
    messages: [message],
  });
  await producer.disconnect();

  // Return the job ID to the client
  res.json({ jobId });
});

app.get("/jobs/:id/status", async (req, res) => {
  const jobId = req.params.id;

  try {
    const { rows } = await pool.query(
      "SELECT status FROM job_statuses WHERE job_id = $1",
      [jobId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({ status: rows[0].status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch job status" });
  }
});

app.get("/jobs/:id/result", async (req, res) => {
  const jobId = req.params.id;

  try {
    const { rows } = await pool.query(
      "SELECT result, created_at FROM job_statuses WHERE job_id = $1",
      [jobId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (!rows[0].result) {
      return res.status(400).json({ error: "Job not completed yet" });
    }

    const elapsedTime = Date.now() - new Date(rows[0].created_at).getTime();
    res.json({ result: rows[0].result, elapsedTime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch job result" });
  }
});

app.delete("/jobs/:id", async (req, res) => {
  const jobId = req.params.id;

  try {
    const { rowCount } = await pool.query(
      "DELETE FROM job_statuses WHERE job_id = $1",
      [jobId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Send a message to the job-deletions topic
    await producer.connect();
    await producer.send({
      topic: "job-deletions",
      messages: [{ key: jobId, value: JSON.stringify({ jobId }) }],
    });
    await producer.disconnect();

    res.json({ message: "Job deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

app.get("/jobs", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1]; // Extract bearer token

  try {
    const { rows } = await pool.query(
      "SELECT job_id, status, created_at FROM job_statuses WHERE token = $1",
      [token]
    );

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch submitted jobs" });
  }
});

app.put("/observer/parameters", async (req, res) => {
  const parameters = req.body;

  // Send a message to the observer-parameters topic
  await producer.connect();
  await producer.send({
    topic: "observer-parameters",
    messages: [{ value: JSON.stringify(parameters) }],
  });
  await producer.disconnect();

  res.json({ message: "Observer parameters updated" });
});
app.listen(3002, () => {
  console.log("Job API listening on port 3002");
});
