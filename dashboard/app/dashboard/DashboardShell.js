"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = "/api";

export default function DashboardShell({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }
        return res.json();
      })
      .then(() => setReady(true))
      .catch(() => {
        localStorage.removeItem("token");
        router.replace("/login");
      });
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.replace("/login");
  }

  if (!ready) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 200, padding: 24, borderRight: "1px solid #eee" }}>
        <h2>WAHA</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/devices">Device Management</Link>
          <Link href="/dashboard/chat">Chat</Link>
          <Link href="/dashboard/broadcast">Broadcast</Link>
          <Link href="/dashboard/analytics">Analytics</Link>
          <button
            type="button"
            onClick={handleLogout}
            style={{ marginTop: 16, padding: "8px 12px", cursor: "pointer", textAlign: "left", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 4 }}
          >
            Logout
          </button>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}
