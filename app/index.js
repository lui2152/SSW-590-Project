const express = require("express");
const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));
const PORT = 3000;

const startTime = Date.now();
let restartCount = 0;

app.get("/status", (req, res) => {
  res.json({
    status: "ok",
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    restarts: restartCount,
    timestamp: new Date().toISOString(),
  });
});

app.get("/stress", (req, res) => {
  const end = Date.now() + 3000;
  while (Date.now() < end) {}
  res.json({ status: "stress test complete" });
});

app.listen(PORT, () => {
  console.log(`FlashClash running on port ${PORT}`);
});
