"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 24, maxWidth: 480, margin: "0 auto" }}>
      <h1>WAHA Dashboard</h1>
      <p>WhatsApp API &amp; Automation</p>
      <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/login">Login</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/devices">Devices</Link>
        <Link href="/dashboard/broadcast">Broadcast</Link>
        <Link href="/dashboard/analytics">Analytics</Link>
      </nav>
    </div>
  );
}
