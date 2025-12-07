const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Basic route
app.get("/", (req, res) => {
  res.send("✅ Bot is alive!");
});

// Optional status route
app.get("/status", (req, res) => {
  res.json({
    status: "online",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

function keepAlive() {
  app.listen(PORT, () => {
    console.log(`🚀 Keep-alive server running on port ${PORT}`);
  });
}

module.exports = keepAlive;
