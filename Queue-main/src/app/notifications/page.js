"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/Footer";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const queueId = localStorage.getItem("myQueueId");
      if (!queueId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/notifications?queueId=${queueId}`);
        const data = await res.json();
        setNotifications(data);
        
        // Mark all as read when page is opened
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queueId }),
        });
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div id="app-container">
        <div style={{ backgroundColor: "#eef0f8", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <div style={{ background: "white", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px", padding: "22px 20px 18px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <i className="fa-solid fa-chevron-left" style={{ color: "#444", fontSize: "20px", cursor: "pointer" }} onClick={() => router.push("/")}></i>
                    <h2 style={{ color: "#444", fontWeight: 600, fontSize: "18px", lineHeight: 1.2 }}>การแจ้งเตือน</h2>
                </div>
            </div>

            <div style={{ padding: "0 20px 24px", flex: 1 }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>กำลังโหลด...</div>
                ) : notifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 20px", color: "#999" }}>
                        <i className="fa-regular fa-bell-slash" style={{ fontSize: "40px", marginBottom: "16px", display: "block" }}></i>
                        ไม่มีการแจ้งเตือนในขณะนี้
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {notifications.map((notif) => (
                            <div key={notif.id} style={{ background: "white", borderRadius: "14px", padding: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", borderLeft: notif.is_read ? "none" : "4px solid #4361ee" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                                    <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#333" }}>{notif.title}</h3>
                                    <span style={{ fontSize: "11px", color: "#999" }}>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.5 }}>{notif.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    </div>
  );
}
