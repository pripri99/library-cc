const redis = require("redis");
const { promisify } = require("util");

const client = redis.createClient({
  host: "localhost", // or the Redis server's host/IP
  port: 6379, // or the Redis server's port
});

client.on("error", (error) => {
  console.error("Redis error:", error);
});

// Add these functions to redisClient.js

async function connect() {
  return new Promise((resolve, reject) => {
    client.on("connect", resolve);
    client.on("error", reject);
  });
}

async function disconnect() {
  return new Promise((resolve, reject) => {
    client.quit((err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

// Promisify redis methods for easier use with async/await
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const lpushAsync = promisify(client.lPush).bind(client);
const lrangeAsync = promisify(client.lRange).bind(client);

// Export the new functions

module.exports = {
  getAsync,
  setAsync,
  lpushAsync,
  lrangeAsync,
  connect,
  disconnect,
  redisClient: client, // Add this line
};
