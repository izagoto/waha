"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

const API = "/api";

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [newId, setNewId] = useState("");
  const [qr, setQr] = useState(null);
  const [connectingId, setConnectingId] = useState(null);

  async function loadDevices() {
    try {
      const res = await fetch(`${API}/devices`);
      const data = await res.json();
      setDevices(Array.isArray(data) ? data : []);
    } catch {
      setDevices([]);
    }
  }

  useEffect(() => {
    loadDevices();
  }, []);

  async function createDevice() {
    if (!newId.trim()) return;
    try {
      await fetch(`${API}/devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: newId.trim() }),
      });
      setNewId("");
      loadDevices();
    } catch (e) {
      console.error(e);
    }
  }

  async function connectDevice(id) {
    setConnectingId(id);
    setQr(null);
    try {
      const res = await fetch(`${API}/devices/${id}/connect`, { method: "POST" });
      const data = await res.json();
      if (data.qrCode) setQr(data.qrCode);
      if (data.status === "connected") setQr(null);
      loadDevices();
    } catch (e) {
      console.error(e);
    } finally {
      setConnectingId(null);
    }
  }

  async function deleteDevice(id) {
    if (!confirm("Hapus device?")) return;
    try {
      await fetch(`${API}/devices/${id}`, { method: "DELETE" });
      setQr(null);
      loadDevices();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <h1>Device Management</h1>
      <div style={{ marginBottom: 24 }}>
        <input
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          placeholder="Device ID"
          style={{ marginRight: 8, padding: 8 }}
        />
        <button onClick={createDevice}>Add Device</button>
      </div>
      {qr && (
        <div style={{ marginBottom: 24, padding: 16, background: "#f5f5f5" }}>
          <p>Scan QR dengan WhatsApp:</p>
          <QRCodeSVG value={qr} size={200} />
        </div>
      )}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {devices.map((d) => (
          <li
            key={d.deviceId}
            style={{
              padding: 12,
              border: "1px solid #eee",
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {d.deviceId} — <strong>{d.status}</strong>
            </span>
            <span>
              <button
                onClick={() => connectDevice(d.deviceId)}
                disabled={connectingId === d.deviceId || d.status === "connected"}
              >
                {d.status === "connected" ? "Connected" : "Connect / QR"}
              </button>
              <button
                onClick={() => deleteDevice(d.deviceId)}
                style={{ marginLeft: 8 }}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
