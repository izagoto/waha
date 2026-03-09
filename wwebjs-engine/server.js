const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const path = require("path");

const app = express();
app.use(express.json());

// Simpan session: gunakan WWEBJS_DATA_PATH di Docker (mis. /data), else folder root project
const ROOT_DIR = process.env.WWEBJS_DATA_PATH || path.join(__dirname, "..");
const AUTH_PATH = path.join(ROOT_DIR, ".wwebjs_auth");

let lastQr = null;
let isReady = false;

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "default",
    dataPath: AUTH_PATH,
  }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("[wwebjs] QR received");
  lastQr = qr;
});

client.on("ready", () => {
  console.log("[wwebjs] WhatsApp ready");
  isReady = true;
  lastQr = null;
});

client.on("disconnected", (reason) => {
  console.log("[wwebjs] Disconnected:", reason);
  isReady = false;
});

client.initialize();

// Health
app.get("/", (req, res) => {
  res.json({
    name: "WWebJS Engine",
    status: isReady ? "ready" : "waiting",
  });
});

// Ambil QR string untuk di-render oleh dashboard
app.get("/devices/qr", (req, res) => {
  if (isReady) {
    return res.json({ status: "connected" });
  }
  if (!lastQr) {
    return res.json({ status: "no-qr" });
  }
  res.json({ status: "qr", qrCode: lastQr });
});

// Status device tunggal
app.get("/devices/status", (req, res) => {
  res.json({ status: isReady ? "connected" : "disconnected" });
});

// Kirim pesan
app.post("/messages/send", async (req, res) => {
  if (!isReady) {
    return res.status(400).json({ error: "device not connected" });
  }
  const { to, text } = req.body || {};
  if (!to || !text) {
    return res.status(400).json({ error: "to and text required" });
  }
  const jid = to.includes("@") ? to : `${to}@c.us`;
  try {
    const msg = await client.sendMessage(jid, text);
    res.json({
      status: "sent",
      id: msg.id?._serialized,
      to,
    });
  } catch (err) {
    console.error("[wwebjs] sendMessage error:", err);
    res.status(500).json({ error: err.message || "failed to send message" });
  }
});

const PORT = process.env.WWEBJS_PORT || 8090;
app.listen(PORT, () => {
  console.log(`WWebJS engine running on port ${PORT}`);
});

