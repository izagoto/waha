"use client";

import { useState } from "react";

const API = "/api";

export default function BroadcastPage() {
  const [deviceId, setDeviceId] = useState("");
  const [text, setText] = useState("");
  const [recipients, setRecipients] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);

  async function startCampaign() {
    setResult(null);
    setJobStatus(null);
    if (!deviceId.trim() || !text.trim() || !recipients.trim()) {
      setResult({ error: "Isi semua field." });
      return;
    }
    const list = recipients
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (!list.length) {
      setResult({ error: "Masukkan minimal 1 nomor." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/broadcast/campaign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: deviceId.trim(),
          text: text.trim(),
          recipients: list,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error || "Gagal membuat campaign." });
      } else {
        setResult(data);
      }
    } catch (e) {
      setResult({ error: e.message || "Gagal membuat campaign." });
    } finally {
      setLoading(false);
    }
  }

  async function fetchJob(jobId) {
    try {
      const res = await fetch(`${API}/broadcast/job/${jobId}`);
      const data = await res.json();
      if (!res.ok) {
        setJobStatus({ error: data.error || "Gagal mengambil status job." });
      } else {
        setJobStatus(data);
      }
    } catch (e) {
      setJobStatus({ error: e.message || "Gagal mengambil status job." });
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1>Broadcast</h1>
      <p>Kirim pesan massal dengan queue (Bull + Redis).</p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr" }}>
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>Device ID</label>
          <input
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder="device1"
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>Pesan</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 4 }}>
            Nomor Tujuan (satu per baris)
          </label>
          <textarea
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            rows={6}
            style={{ width: "100%", padding: 8 }}
            placeholder={"628111111111\n628122222222"}
          />
        </div>
      </div>

      <button
        onClick={startCampaign}
        disabled={loading}
        style={{ marginTop: 12, padding: "8px 16px" }}
      >
        {loading ? "Mengirim..." : "Mulai Broadcast"}
      </button>

      {result && (
        <div style={{ marginTop: 16, padding: 12, background: "#f5f5f5" }}>
          {result.error ? (
            <p style={{ color: "red" }}>{result.error}</p>
          ) : (
            <>
              <p>
                Status: <strong>{result.status}</strong> — Jobs: {result.count}
              </p>
              {result.jobs?.length ? (
                <ul>
                  {result.jobs.map((j) => (
                    <li key={j.jobId}>
                      Job {j.jobId} → {j.to}{" "}
                      <button
                        type="button"
                        onClick={() => fetchJob(j.jobId)}
                        style={{ marginLeft: 8 }}
                      >
                        Lihat status
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          )}
        </div>
      )}

      {jobStatus && (
        <div style={{ marginTop: 16, padding: 12, background: "#eef" }}>
          {jobStatus.error ? (
            <p style={{ color: "red" }}>{jobStatus.error}</p>
          ) : (
            <>
              <p>
                Job <strong>{jobStatus.id}</strong> — state:{" "}
                <strong>{jobStatus.state}</strong>
              </p>
              <pre
                style={{
                  marginTop: 8,
                  padding: 8,
                  background: "#fff",
                  border: "1px solid #ddd",
                  fontSize: 12,
                  overflowX: "auto",
                }}
              >
                {JSON.stringify(jobStatus, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}

