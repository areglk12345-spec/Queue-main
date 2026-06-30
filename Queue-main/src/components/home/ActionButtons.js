"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/components/providers/LiffProvider";
import Popup from "@/components/shared/Popup";

export default function ActionButtons() {
  const router = useRouter();
  const { liff } = useLiff();
  const [showQueuePopup, setShowQueuePopup] = useState(false);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [popupData, setPopupData] = useState({ title: "", desc: "" });

  const checkQueueActive = async (id) => {
    try {
      const res = await fetch(`/api/queue/my-queue?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (['completed', 'cancelled'].includes(data.status)) {
          localStorage.removeItem("myQueueId");
          return false;
        }
        return true;
      }
      localStorage.removeItem("myQueueId");
      return false;
    } catch (err) {
      return false;
    }
  };

  const handleBookQueue = async () => {
    const queueId = localStorage.getItem("myQueueId");
    if (queueId) {
      const isActive = await checkQueueActive(queueId);
      if (isActive) {
        setPopupData({ 
          title: "คุณมีการจองคิวอยู่แล้ว", 
          desc: "คุณสามารถตรวจสอบสถานะคิวของคุณได้ที่เมนู 'ดูคิวของฉัน' หากต้องการจองใหม่กรุณายกเลิกคิวเดิมก่อน" 
        });
        setShowQueuePopup(true);
      } else {
        router.push('/queue/book');
      }
    } else {
      router.push('/queue/book');
    }
  };

  const handleViewQueue = async () => {
    const queueId = localStorage.getItem("myQueueId");
    if (!queueId) {
      setPopupData({ title: "ยังไม่มีการจองคิว", desc: "คุณยังไม่มีการจองคิว กรุณาจองคิวก่อน" });
      setShowQueuePopup(true);
    } else {
      const isActive = await checkQueueActive(queueId);
      if (isActive) {
        router.push('/queue/result');
      } else {
        setPopupData({ title: "คิวของคุณจบลงแล้ว", desc: "คิวเดิมของคุณถูกยกเลิกหรือเสร็จสิ้นแล้ว คุณสามารถจองคิวใหม่ได้ทันที" });
        setShowQueuePopup(true);
      }
    }
  };

  const handleCancelQueue = () => {
    const queueId = localStorage.getItem("myQueueId");
    if (!queueId) {
      setPopupData({ title: "ยังไม่มีการจองคิว", desc: "คุณยังไม่มีการจองคิว กรุณาจองคิวก่อน" });
      setShowQueuePopup(true);
    } else {
      setShowCancelPopup(true);
    }
  };

  const confirmCancel = async () => {
    const id = localStorage.getItem("myQueueId");
    let currentLineUserId = null;

    // 1. ดึงไอดี LINE ด้วยวิธีที่รวดเร็วที่สุดสำหรับมือถือ
    if (liff && liff.isLoggedIn()) {
      const context = liff.getContext();
      if (context && context.userId) {
        currentLineUserId = context.userId;
      } else {
        try {
          const profile = await liff.getProfile();
          currentLineUserId = profile.userId;
        } catch (err) {
          console.error("Profile error:", err);
        }
      }
    }

    // ป้องกันการกดยกเลิกตอนที่ยังดึงไอดีไม่เสร็จ
    if (!currentLineUserId) {
        alert("กำลังดึงข้อมูล LINE ของคุณ กรุณารอสักครู่แล้วกดใหม่ครับ");
        return;
    }

    try {
      const res = await fetch("/api/queue/cancel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, lineUserId: currentLineUserId }),
      });
      
      // 2. ดักจับ Error ตรงนี้! ถ้าหลังบ้านปฏิเสธ จะได้ไม่หลอกว่าสำเร็จ
      if (!res.ok) {
        const errorData = await res.json();
        alert("เกิดข้อผิดพลาด: " + (errorData.error || "ไม่สามารถยกเลิกคิวได้"));
        return; // <--- หยุดการทำงานทันที ไม่ลบคิวในหน้าเว็บ
      }

      localStorage.removeItem("myQueueId");
      setShowCancelPopup(false);
      
      setTimeout(() => {
        setPopupData({ title: "ยกเลิกคิวเรียบร้อย", desc: "ระบบได้ยกเลิกคิวของคุณแล้ว" });
        setShowQueuePopup(true);
      }, 300);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {/* Book Queue */}
        <div style={{ background: "white", borderRadius: "12px", padding: "16px 10px", display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 100px", minWidth: "100px", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#ffffff", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "12px", border: "2px solid #e0e7ff", boxShadow: "inset 0 0 10px rgba(67,97,238,0.05)" }}>
            <i className="fa-solid fa-calendar-check" style={{ color: "#4361ee", fontSize: "20px" }}></i>
          </div>
          <h3 style={{ fontSize: "13px", color: "#4361ee", fontWeight: 600, marginBottom: "4px" }}>จองคิว</h3>
          <p style={{ fontSize: "9px", color: "#666", textAlign: "center", marginBottom: "12px", lineHeight: 1.3, height: "35px" }}>กรอกชื่อ หน่วยงาน<br/>จำนวนบุคคล</p>
          <button onClick={handleBookQueue} style={{ background: "#4361ee", color: "white", border: "none", width: "100%", padding: "8px 0", borderRadius: "6px", fontSize: "11px", fontWeight: 500, fontFamily: "'Prompt', sans-serif", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", boxShadow: "0 2px 6px rgba(67,97,238,0.3)" }}>
            จองคิว <i className="fa-solid fa-arrow-right" style={{ fontSize: "9px" }}></i>
          </button>
        </div>

        {/* View Queue */}
        <div style={{ background: "#ebfaef", borderRadius: "12px", padding: "16px 10px", display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 100px", minWidth: "100px", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#ffffff", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "12px", border: "2px solid #dcfce7", boxShadow: "inset 0 0 10px rgba(16,185,129,0.05)" }}>
            <i className="fa-solid fa-ticket" style={{ color: "#10b981", fontSize: "20px", transform: "rotate(-45deg)" }}></i>
          </div>
          <h3 style={{ fontSize: "13px", color: "#10b981", fontWeight: 600, marginBottom: "4px" }}>ดูคิวของฉัน</h3>
          <p style={{ fontSize: "9px", color: "#444", textAlign: "center", marginBottom: "12px", lineHeight: 1.3, height: "35px" }}>ตรวจสอบสถานะคิว<br/>และลำดับคิวปัจจุบัน</p>
          <button onClick={handleViewQueue} style={{ background: "#10b981", color: "white", border: "none", width: "100%", padding: "8px 0", borderRadius: "6px", fontSize: "11px", fontWeight: 500, fontFamily: "'Prompt', sans-serif", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", boxShadow: "0 2px 6px rgba(16,185,129,0.3)" }}>
            ดูคิวของฉัน <i className="fa-solid fa-arrow-right" style={{ fontSize: "9px" }}></i>
          </button>
        </div>

        {/* Cancel Queue */}
        <div style={{ background: "#fff0f0", borderRadius: "12px", padding: "16px 10px", display: "flex", flexDirection: "column", alignItems: "center", flex: "1 1 100px", minWidth: "100px", boxShadow: "0 4px 10px rgba(0,0,0,0.02)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#ffffff", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "12px", border: "2px solid #ffe4e6", boxShadow: "inset 0 0 10px rgba(239,68,68,0.05)" }}>
            <i className="fa-solid fa-circle-xmark" style={{ color: "#ef4444", fontSize: "24px" }}></i>
          </div>
          <h3 style={{ fontSize: "13px", color: "#ef4444", fontWeight: 600, marginBottom: "4px" }}>ยกเลิกคิว</h3>
          <p style={{ fontSize: "9px", color: "#444", textAlign: "center", marginBottom: "12px", lineHeight: 1.3, height: "35px" }}>ยกเลิกการจองคิว</p>
          <button onClick={handleCancelQueue} style={{ background: "#ef4444", color: "white", border: "none", width: "100%", padding: "8px 0", borderRadius: "6px", fontSize: "11px", fontWeight: 500, fontFamily: "'Prompt', sans-serif", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", boxShadow: "0 2px 6px rgba(239,68,68,0.3)" }}>
            ยกเลิกคิว <i className="fa-solid fa-arrow-right" style={{ fontSize: "9px" }}></i>
          </button>
        </div>
      </div>

      {/* Info/Warning Popup */}
      {showQueuePopup && (
        <div className={`popup-overlay ${showQueuePopup ? "show" : ""}`} onClick={() => setShowQueuePopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <div className="popup-icon">
              <i className="fa-solid fa-circle-info"></i>
            </div>
            <div className="popup-title">{popupData.title}</div>
            <div className="popup-desc">{popupData.desc}</div>
            <div className="popup-buttons">
              <button className="popup-btn popup-btn-confirm" onClick={() => setShowQueuePopup(false)}>ตกลง</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Popup */}
      <Popup
        isOpen={showCancelPopup}
        onClose={() => setShowCancelPopup(false)}
        onConfirm={confirmCancel}
        title="ยกเลิกคิวของคุณ?"
        description="หากยกเลิกคิวแล้ว คุณจะต้องทำการจองคิวใหม่อีกครั้ง"
      />
    </>
  );
}
