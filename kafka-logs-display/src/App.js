import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "http://localhost:6000"; // Replace with your server's base URL

function App() {
  const [topic, setTopic] = useState("addBook");
  const [logs, setLogs] = useState({ sentMessages: [], receivedMessages: [] });

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchLogs(topic);
    }, 5000); // Fetch logs every 5 seconds

    return () => clearInterval(intervalId);
  }, [topic]);

  const fetchLogs = async (topic) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/kafka-logs/${topic}`
      );
      setLogs(response.data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    }
  };

  const renderTable = (messages) => (
    <table>
      <thead>
        <tr>
          <th>Message</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {messages.map((msg, index) => (
          <tr key={index}>
            <td>{JSON.stringify(msg.message)}</td>
            <td>{new Date(msg.timestamp).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="App">
      <h1>Kafka Logs Display</h1>
      <div>
        <label htmlFor="topic">Topic: </label>
        <input
          type="text"
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>
      <h2>Sent Messages</h2>
      {renderTable(logs.sentMessages)}
      <h2>Received Messages</h2>
      {renderTable(logs.receivedMessages)}
    </div>
  );
}

export default App;
