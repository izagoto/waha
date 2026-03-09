const express = require("express");
const engine = require("../services/engineService");
const { getReply } = require("../services/aiService");

const router = express.Router();

// Incoming message webhook: Engine (or external) calls this → AI processing → auto reply
router.post("/incoming", async (req, res) => {
  try {
    const { deviceId, from, text } = req.body;
    if (!deviceId || !from) {
      return res.status(400).json({ error: "deviceId, from required" });
    }
    const incomingText = text || "";
    const replyText = await getReply(incomingText);
    await engine.sendMessage(deviceId, from, replyText);
    res.json({ status: "replied", to: from });
  } catch (err) {
    console.error("[Webhook incoming]", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
