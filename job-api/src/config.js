const config = {
  kafka: {
    clientId: "job-api",
    brokers: ["localhost:9092"],
  },
  postgres: {
    // PostgreSQL connection config
  },
  websocket: {
    port: 3002,
  },
  app: {
    port: 3002,
  },
};

module.exports = config;
