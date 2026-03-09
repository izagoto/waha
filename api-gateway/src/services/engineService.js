const axios = require("axios");

const ENGINE_URL = process.env.ENGINE_URL || "http://localhost:8090";

const client = axios.create({
  baseURL: ENGINE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// WWebJS integration:
// - single logical device (LocalAuth clientId \"default\")
// - /devices/status → { status: \"connected\" | \"disconnected\" }
// - /devices/qr     → { status: \"qr\" | \"connected\" | \"no-qr\", qrCode? }

async function getDevices() {
  const { data } = await client.get("/devices/status");
  const status = data?.status || "disconnected";
  return [
    {
      deviceId: "default",
      status,
    },
  ];
}

async function createDevice(deviceId) {
  // Untuk wwebjs, tidak ada konsep create; cukup kembalikan status current.
  const devices = await getDevices();
  return {
    deviceId: deviceId || "default",
    status: devices[0]?.status || "disconnected",
  };
}

async function deleteDevice(deviceId) {
  // Belum ada endpoint logout khusus; anggap saja dihapus di level app.
  return { deviceId, status: "deleted" };
}

async function connectDevice(deviceId) {
  // Ambil QR terakhir dari engine wwebjs.
  const { data } = await client.get("/devices/qr");
  return data;
}

async function getDeviceStatus(deviceId) {
  const { data } = await client.get("/devices/status");
  return {
    deviceId: deviceId || "default",
    status: data?.status || "disconnected",
  };
}

async function sendMessage(deviceId, to, text) {
  const { data } = await client.post("/messages/send", {
    to,
    text,
  });
  return data;
}

module.exports = {
  getDevices,
  createDevice,
  deleteDevice,
  connectDevice,
  getDeviceStatus,
  sendMessage,
};
