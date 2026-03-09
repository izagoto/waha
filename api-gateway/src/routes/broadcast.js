const express = require("express");
const { addToQueue, getJobStatus } = require("../queues/messageQueue");

const router = express.Router();

// Campaign: add multiple recipients to queue
router.post("/campaign", async (req, res) => {
  try {
    const { deviceId, text, recipients } = req.body;
    if (!deviceId || !text || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        error: "deviceId, text, recipients[] required",
      });
    }
    const jobs = [];
    for (const to of recipients) {
      const num = typeof to === "string" ? to.trim() : String(to).trim();
      if (!num) continue;
      const { jobId } = await addToQueue(deviceId, num, text);
      jobs.push({ jobId, to: num });
    }
    res.status(202).json({
      status: "queued",
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/job/:jobId", async (req, res) => {
  try {
    const status = await getJobStatus(req.params.jobId);
    if (!status) return res.status(404).json({ error: "Job not found" });
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
