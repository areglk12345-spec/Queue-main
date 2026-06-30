"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TopHeader() {
  const router = useRouter();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const checkNotifications = async () => {
      const queueId = localStorage.getItem("myQueueId");
      if (!queueId) return;

      try {
        const res = await fetch(`/api/notifications?queueId=${queueId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setHasUnread(data.some(n => !n.is_read));
        }
      } catch (err) {
        console.error("Error checking notifications:", err);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: "white", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px", padding: "30px 24px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", marginBottom: "24px" }}>
        <div style={{ width: "100px", height: "50px", display: "flex", alignItems: "center", cursor: "pointer", position: "relative" }} onClick={() => router.push("/")}>
            <Image 
                src="/images/logo_ncsa.png" 
                alt="NCSA Logo" 
                fill 
                style={{ objectFit: "contain" }} 
                priority
            />
        </div>
        <div className="bell-btn" style={{ background: "transparent", color: "#444", width: "42px", height: "42px", cursor: "pointer", position: "relative" }} onClick={() => router.push("/notifications")}>
            <i className="fa-regular fa-bell" style={{ fontSize: "22px" }}></i>
            {hasUnread && (
                <div className="bell-dot" style={{ position: "absolute", top: "10px", right: "10px", width: "8px", height: "8px", backgroundColor: "#ff3b30", borderRadius: "50%" }}></div>
            )}
        </div>
    </div>
  );
}
