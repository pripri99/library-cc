const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./config");
const pool = require("./db");
const { producer } = require("./kafka");
const routes = require("./routes");
const wss = require("./websocket");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use("/", routes);

app.listen(config.app.port, () => {
  console.log(`Job API listening on port ${config.app.port}`);
});
