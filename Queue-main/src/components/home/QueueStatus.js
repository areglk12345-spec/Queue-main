"use client";
import { useState, useEffect } from "react";

export default function QueueStatus() {
  const [status, setStatus] = useState({ current: "000", next: "-", total: 0 });

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/queue/status", { signal });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error("QueueStatus fetch error:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Update every 5s
    return () => {
        controller.abort();
        clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ background: "white", borderRadius: "8px", padding: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #f0f0f0", paddingBottom: "12px" }}>
            <i className="fa-solid fa-chart-simple" style={{ color: "#4361ee", fontSize: "18px", marginRight: "10px" }}></i>
            <h3 style={{ fontSize: "15px", color: "#444", fontWeight: 600 }}>สถานะคิววันนี้</h3>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center" }}>
            <div style={{ flex: 1, borderRight: "1px solid #f0f0f0" }}>
                <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontWeight: 500 }}>คิวปัจจุบัน</p>
                <h2 style={{ fontSize: "28px", color: "#444", fontWeight: 500, lineHeight: 1, fontFamily: "'Consolas', 'Courier New', monospace", fontVariantNumeric: "slashed-zero" }}>{status.current}</h2>
            </div>
            <div style={{ flex: 1, borderRight: "1px solid #f0f0f0" }}>
                <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontWeight: 500 }}>คิวถัดไป</p>
                <h2 style={{ fontSize: "28px", color: "#444", fontWeight: 500, lineHeight: 1, fontFamily: "'Consolas', 'Courier New', monospace", fontVariantNumeric: "slashed-zero" }}>{status.next}</h2>
            </div>
            <div style={{ flex: 1 }}>
                <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px", fontWeight: 500 }}>จำนวนคิววันนี้</p>
                <h2 style={{ fontSize: "28px", color: "#444", fontWeight: 500, lineHeight: 1, fontFamily: "'Consolas', 'Courier New', monospace", fontVariantNumeric: "slashed-zero" }}>{status.total}</h2>
            </div>
        </div>
    </div>
  );
}
