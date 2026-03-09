"use client";

import { useState } from "react";

const API = "/api";

export default function ChatPage() {
  const [deviceId, setDeviceId] = useState("");
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    setStatus("");
    if (!deviceId.trim() || !to.trim() || !text.trim()) {
      setStatus("Isi deviceId, nomor tujuan, dan pesan.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: deviceId.trim(),
          to: to.trim(),
          text: text.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Gagal mengirim pesan.");
      } else {
        setStatus(`Terkirim ke ${data.to || to.trim()}`);
        setText("");
      }
    } catch (e) {
      setStatus(e.message || "Gagal mengirim pesan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1>Chat</h1>
      <p>Kirim 1 pesan langsung via API.</p>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Device ID</label>
        <input
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          placeholder="device1"
          style={{ width: "100%", padding: 8 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Nomor Tujuan</label>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="628123456789"
          style={{ width: "100%", padding: 8 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 4 }}>Pesan</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          style={{ width: "100%", padding: 8 }}
        />
      </div>
      <button onClick={sendMessage} disabled={loading}>
        {loading ? "Mengirim..." : "Kirim Pesan"}
      </button>
      {status && (
        <p style={{ marginTop: 12, color: status.startsWith("Terkirim") ? "green" : "red" }}>
          {status}
        </p>
      )}
    </div>
  );
}

