const express = require("express");
const engine = require("../services/engineService");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const devices = await engine.getDevices();
    res.json(devices);
  } catch (err) {
    res.status(err.response?.status || 502).json({
      error: err.message || "Engine unavailable",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) {
      return res.status(400).json({ error: "deviceId required" });
    }
    const result = await engine.createDevice(deviceId);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.response?.status || 502).json({
      error: err.message || "Engine unavailable",
    });
  }
});

router.delete("/:deviceId", async (req, res) => {
  try {
    const result = await engine.deleteDevice(req.params.deviceId);
    res.json(result);
  } catch (err) {
    res.status(err.response?.status || 502).json({
      error: err.message || "Engine unavailable",
    });
  }
});

router.post("/:deviceId/connect", async (req, res) => {
  try {
    const result = await engine.connectDevice(req.params.deviceId);
    res.json(result);
  } catch (err) {
    res.status(err.response?.status || 502).json({
      error: err.message || "Engine unavailable",
    });
  }
});

router.get("/:deviceId/status", async (req, res) => {
  try {
    const result = await engine.getDeviceStatus(req.params.deviceId);
    res.json(result);
  } catch (err) {
    res.status(err.response?.status || 502).json({
      error: err.message || "Engine unavailable",
    });
  }
});

module.exports = router;
