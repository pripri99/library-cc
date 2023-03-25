const producer = require("./producer");
const consumer = require("./consumer");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("views"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

producer("Hello, KafkaJS!");
