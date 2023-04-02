const WebSocket = require("ws");
const config = require("./config");
const { kafka } = require("./kafka");

const wss = new WebSocket.Server({ port: config.websocket.port });

// WebSocket server logic

module.exports = wss;
