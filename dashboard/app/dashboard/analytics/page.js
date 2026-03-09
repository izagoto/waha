"use client";

import { useState, useEffect } from "react";

const API = "/api";

export default function AnalyticsPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/devices`);
        const data = await res.ok ? res.json() : [];
        setDevices(Array.isArray(data) ? data : []);
      } catch {
        setDevices([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const connected = devices.filter((d) => d.status === "connected").length;

  return (
    <div>
      <h1>Analytics</h1>
      <p>Ringkasan status dan penggunaan.</p>

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", marginTop: 24 }}>
          <div style={{ padding: 20, background: "#f0f9ff", borderRadius: 8, border: "1px solid #e0f2fe" }}>
            <div style={{ fontSize: 14, color: "#0369a1" }}>Device terhubung</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{connected}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>dari {devices.length} device</div>
          </div>
          <div style={{ padding: 20, background: "#f0fdf4", borderRadius: 8, border: "1px solid #dcfce7" }}>
            <div style={{ fontSize: 14, color: "#15803d" }}>Pesan terkirim</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>—</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>statistik bisa ditambahkan via API</div>
          </div>
          <div style={{ padding: 20, background: "#fefce8", borderRadius: 8, border: "1px solid #fef9c3" }}>
            <div style={{ fontSize: 14, color: "#a16207" }}>Broadcast jobs</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>—</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>cek status per job di halaman Broadcast</div>
          </div>
        </div>
      )}

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 18 }}>Status device</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {devices.length === 0 && !loading && <li style={{ color: "#64748b" }}>Belum ada device.</li>}
          {devices.map((d) => (
            <li key={d.deviceId} style={{ padding: "8px 0", borderBottom: "1px solid #eee" }}>
              <strong>{d.deviceId}</strong> — <span style={{ color: d.status === "connected" ? "green" : "#64748b" }}>{d.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
