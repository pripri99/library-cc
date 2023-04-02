const { producer, pool } = require("../config");
const { sendJobUpdate } = require("../websocket");

const createJob = async (req, res) => {
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
};

const getJobStatus = async (req, res) => {
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
};

const getJobResult = async (req, res) => {
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
};

const deleteJob = async (req, res) => {
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
};

const getSubmittedJobs = async (req, res) => {
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
};

const updateObserverParameters = async (req, res) => {
  const parameters = req.body;

  // Send a message to the observer-parameters topic
  await producer.connect();
  await producer.send({
    topic: "observer-parameters",
    messages: [{ value: JSON.stringify(parameters) }],
  });
  await producer.disconnect();

  res.json({ message: "Observer parameters updated" });
};

const jobController = {
  createJob,
  getJobStatus,
  getJobResult,
  deleteJob,
  getSubmittedJobs,
  updateObserverParameters,
};

module.exports = jobController;
