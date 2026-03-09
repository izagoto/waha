const express = require("express");
const engine = require("../services/engineService");

const router = express.Router();

// POST /engine/send — Node calls this to proxy to Go engine
router.post("/send", async (req, res) => {
  try {
    const { deviceId, to, text } = req.body;
    if (!deviceId || !to || !text) {
      return res.status(400).json({
        error: "deviceId, to, text required",
      });
    }
    const result = await engine.sendMessage(deviceId, to, text);
    res.json(result);
  } catch (err) {
    res.status(err.response?.status || 502).json({
      error: err.response?.data?.error || err.message || "Engine unavailable",
    });
  }
});

module.exports = router;
