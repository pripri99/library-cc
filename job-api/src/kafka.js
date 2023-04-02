const { Kafka } = require("kafkajs");
const { KafkaStreams } = require("node-kafka-streams");
const config = require("./config");
const pool = require("./db");

const kafka = new Kafka(config.kafka);

const producer = kafka.producer();

const kafkaStreams = new KafkaStreams({
  noptions: {
    "metadata.broker.list": config.kafka.brokers.join(","),
    "group.id": "job-api-group",
    "socket.keepalive.enable": true,
    "enable.auto.commit": false,
  },
  tconf: {
    "auto.offset.reset": "earliest",
  },
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

module.exports = { kafka, producer, kafkaStreams };
