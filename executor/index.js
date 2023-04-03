const { Kafka } = require("kafkajs");
const git = require("simple-git");
const CryptoJS = require("crypto-js");
const dotenv = require("dotenv");
const fs = require("fs").promises;

dotenv.config();

const kafka = new Kafka({
  clientId: "executor",
  brokers: ["kafka:9092"], // Update this with your Kafka broker addresses
});

const consumer = kafka.consumer({ groupId: "executor-group" });
const producer = kafka.producer();

const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

const processJob = async (job) => {
  // Remove the folder if it exists
  try {
    await fs.rmdir("book-app-main", { recursive: true });
  } catch (err) {
    console.error("Error removing directory:", err);
  }
  // Clone the repo
  await git().clone(job.GIT_REPO);

  // Decrypt the credentials
  const decryptedCredentials = decrypt(job.credentials);

  // Execute the main function (assuming it's exported by the repo)
  const main = require(`./${job.GIT_REPO}/main`);
  const result = await main({
    dataSourceLinks: job.data_source_links,
    data: job.data,
    dataSinkLinks: job.data_sink_links,
    credentials: decryptedCredentials,
  });

  return result;
};

const initKafkaConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "job-queue", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const job = JSON.parse(message.value.toString());
      console.log("Job received:", job);

      const startTime = Date.now();
      const result = await processJob(job);
      const elapsedTime = Date.now() - startTime;

      const resultMessage = {
        jobId: job.id,
        result,
        elapsedTime,
      };

      await producer.send({
        topic: "job-results",
        messages: [{ value: JSON.stringify(resultMessage) }],
      });

      console.log("Job result sent:", resultMessage);
    },
  });
};

(async () => {
  await producer.connect();
  await initKafkaConsumer();
})();
