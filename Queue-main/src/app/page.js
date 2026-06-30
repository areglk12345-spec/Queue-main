"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/components/providers/LiffProvider";
import TopHeader from "@/components/home/TopHeader";
import ActionButtons from "@/components/home/ActionButtons";
import QueueStatus from "@/components/home/QueueStatus";
import Announcement from "@/components/home/Announcement";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  const router = useRouter();
  const { isInitialized } = useLiff();

  useEffect(() => {
    // If LIFF is initialized, we don't auto-redirect anymore to allow returning to home screen.
    // The user can click "ดูคิวของฉัน" to see their active queue.
  }, [isInitialized, router]);

  return (
    <div id="app-container">
        <div id="home-view" className="view-container active" style={{ backgroundColor: "#eef0f8", minHeight: "100vh" }}>
            <TopHeader />
            <div style={{ padding: "0 20px 20px" }}>
                {/* Welcome Text */}
                <div style={{ marginBottom: "20px" }}>
                    <h1 style={{ fontSize: "18px", color: "#444", fontWeight: 600, marginBottom: "4px" }}>ยินดีต้อนรับ</h1>
                    <p style={{ fontSize: "13px", color: "#666" }}>เลือกเมนูที่ต้องการ</p>
                </div>

                <ActionButtons />
                <QueueStatus />
                <Announcement />
            </div>
        </div>
        <Footer />
    </div>
  );
}
