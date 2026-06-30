"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QueuePage() {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("myQueueId");
    if (stored) {
      router.replace("/queue/result");
    }
  }, [router]);

  return (
    <div style={{ background: "#eef0f8", minHeight: "100vh", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "40px 24px", textAlign: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.06)", width: "100%" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#eef0f8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <i className="fa-solid fa-ticket" style={{ fontSize: "28px", color: "#b0b5c3", transform: "rotate(-45deg)" }}></i>
        </div>
        <h2 style={{ fontSize: "18px", color: "#444", fontWeight: 600, marginBottom: "8px" }}>ยังไม่มีการจองคิว</h2>
        <p style={{ fontSize: "13px", color: "#888", marginBottom: "24px" }}>กรุณากดปุ่มด้านล่างเพื่อจองคิว</p>
        <button onClick={() => router.push("/queue/book")} style={{ background: "#4361ee", color: "white", border: "none", padding: "14px 32px", borderRadius: "30px", fontSize: "15px", fontWeight: 500, fontFamily: "'Prompt', sans-serif", cursor: "pointer", boxShadow: "0 4px 10px rgba(67,97,238,0.2)" }}>
          จองคิว <i className="fa-solid fa-arrow-right" style={{ fontSize: "12px", marginLeft: "6px" }}></i>
        </button>
      </div>
    </div>
  );
}
