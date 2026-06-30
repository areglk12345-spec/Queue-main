"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/components/providers/LiffProvider";
import Popup from "@/components/shared/Popup";
import Footer from "@/components/layout/Footer";

function InfoCard({ icon, label, value }) {
  return (
    <div style={{ background: "white", borderRadius: "12px", padding: "14px 16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#4b61e6", color: "white", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 34px" }}>
            <i className={icon} style={{ fontSize: "14px" }}></i>
        </div>
        <div>
            <div style={{ fontSize: "13px", color: "#666" }}>{label}</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#444" }}>{value}</div>
        </div>
    </div>
  );
}

export default function QueueResultPage() {
  const router = useRouter();
  const { liff, isInitialized } = useLiff();
  const [queueData, setQueueData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentLineUserId, setCurrentLineUserId] = useState(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchData = async (userId) => {
    // Get ID from URL or localStorage
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || localStorage.getItem("myQueueId");
    
    if (!id) {
      router.replace("/");
      return;
    }

    try {
      const uid = userId || currentLineUserId;
      const res = await fetch(`/api/queue/my-queue?id=${id}${uid ? `&lineUserId=${uid}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        setQueueData(data);
        if (!localStorage.getItem("myQueueId")) {
            localStorage.setItem("myQueueId", id);
        }
      } else {
        router.replace("/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized && liff) {
        if (liff.isLoggedIn()) {
            liff.getProfile().then(profile => {
                setCurrentLineUserId(profile.userId);
                fetchData(profile.userId);
            }).catch(err => {
                console.error("Profile error:", err);
                fetchData();
            });
        } else {
            fetchData();
        }
    } else if (!isInitialized && !window.__LIFF_INIT_STARTED__) {
        fetchData();
    }
  }, [isInitialized, liff, router]);

  useEffect(() => {
    const interval = setInterval(() => fetchData(), 10000); 
    return () => clearInterval(interval);
  }, [currentLineUserId]);

  const handleConfirmCancel = async () => {
    if (!queueData) return;
    const id = queueData.id;
    try {
      const res = await fetch("/api/queue/cancel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, lineUserId: currentLineUserId }),
      });
      
      if (res.ok) {
        localStorage.removeItem("myQueueId");
        setShowPopup(false);
        router.replace("/");
      } else {
          const err = await res.json();
          alert(err.error || "ไม่สามารถยกเลิกคิวได้");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  if (loading) return <div style={{ padding: "50px", textAlign: "center" }}>กำลังโหลดข้อมูล...</div>;
  if (!queueData) return null;

  const isOwner = !queueData.line_user_id || queueData.line_user_id === currentLineUserId;

  const agencyLabel = queueData.agency_type === "cii" ? "CII" : 
                      queueData.agency_type === "regulator" ? "Regulator" : 
                      queueData.agency_type === "gov" ? "ภาครัฐ" : 
                      (queueData.agency_type === 'other' ? queueData.agency_other : "อื่นๆ");

  const paxLabel = queueData.pax_type === "more" ? `${queueData.pax_other} ท่าน` : `${queueData.pax_type} ท่าน`;

  const statusLabel = {
      waiting: "รอเรียกคิว",
      calling: "กำลังเรียกพบ",
      completed: "เสร็จสิ้น",
      cancelled: "ยกเลิกแล้ว"
  }[queueData.status] || "รอเรียกคิว";

  const statusColor = queueData.status === 'calling' ? '#24c31a' : (queueData.status === 'cancelled' ? '#d9141b' : '#4b61e6');

  // Generate Scanable QR Link safely
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (isClient ? window.location.origin : "");
  const qrData = `${baseUrl}/queue/result?id=${queueData.id}`;

  return (
    <div id="app-container">
        <div id="queue-result-view" className="view-container active" style={{ background: "#eef0f8" }}>
            <div style={{ background: "white", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px", padding: "18px 20px 20px", boxShadow: "0 4px 15px rgba(0,0,0,0.08)", marginBottom: "22px" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div onClick={() => router.replace('/')} style={{ cursor: 'pointer', padding: '12px 16px', marginLeft: '-16px', display: 'flex', alignItems: 'center', color: '#111' }}>
                        <i className="fa-solid fa-chevron-left" style={{ fontSize: "20px" }}></i>
                    </div>
                    <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#444" }}>ข้อมูลคิวของคุณ</h2>
                </div>
            </div>


            <div style={{ padding: "0 18px 24px" }}>
                <div style={{ background: "#4b61e6", color: "white", borderRadius: "12px", padding: "18px 16px", boxShadow: "0 8px 16px rgba(75, 97, 230, 0.22)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "white", color: "#4b61e6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="fa-solid fa-ticket-simple" style={{ fontSize: "14px" }}></i>
                        </div>
                        <div>
                            <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>หมายเลขคิวของคุณ</div>
                            <div id="queue-current-display" style={{ fontSize: "34px", fontWeight: 700, lineHeight: 1 }}>{queueData.queue_number}</div>
                        </div>
                    </div>
                    <div style={{ background: "white", color: "#444", borderRadius: "12px", padding: "12px 14px", minWidth: "128px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                        <div style={{ fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: statusColor, display: "inline-block" }}></span>
                            สถานะคิว
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: statusColor }}>{statusLabel}</div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "14px", alignItems: "center", background: "white", borderRadius: "12px", padding: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", marginBottom: "14px" }}>
                    <div style={{ width: "140px", height: "140px", flex: "0 0 140px", display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid #d7d7ea", paddingRight: "14px" }}>
                        <img id="queue-qr-img" src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`} alt="QR Code" style={{ width: "120px", height: "120px", objectFit: "contain" }} />
                    </div>
                    <div style={{ flex: 1, textAlign: "center", color: "#555" }}>
                        <div style={{ paddingBottom: "12px", borderBottom: "1px solid #d7d7ea", margin: "12px 0" }}>
                            <div style={{ fontSize: "13px", color: "#666", marginBottom: "6px" }}>รออีก</div>
                            <div id="waiting-queue-count" style={{ fontSize: "28px", fontWeight: 600, color: "#555" }}>{queueData.waitingCount}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gap: "12px", marginBottom: "18px" }}>
                    <InfoCard icon="fa-solid fa-user-group" label="ชื่อผู้จอง" value={queueData.name} />
                    <InfoCard icon="fa-solid fa-building-columns" label="ประเภทหน่วยงาน" value={agencyLabel} />
                    <InfoCard icon="fa-solid fa-users" label="จำนวนผู้เข้าพบ" value={paxLabel} />
                </div>

                {/* Dynamic Actions based on status and ownership */}
                {['completed', 'cancelled'].includes(queueData.status) ? (
                    isOwner && (
                        <button 
                            onClick={() => { localStorage.removeItem("myQueueId"); router.replace("/queue/book"); }}
                            style={{ width: "100%", background: "#4b61e6", color: "white", border: "none", padding: "14px", borderRadius: "12px", fontSize: "16px", fontWeight: 600, cursor: "pointer", boxShadow: "0 8px 16px rgba(75, 97, 230, 0.22)" }}
                        >
                            <i className="fa-solid fa-plus" style={{ marginRight: "8px" }}></i> จองคิวใหม่
                        </button>
                    )
                ) : (
                    isOwner && (
                        <button className="btn-cancel" onClick={() => setShowPopup(true)} style={{ background: "#d9141b", color: "white", border: "none", boxShadow: "0 8px 16px rgba(217, 20, 27, 0.22)" }}>
                            ยกเลิกการจองคิว
                        </button>
                    )
                )}
            </div>

            <Popup
                isOpen={showPopup}
                onClose={() => setShowPopup(false)}
                onConfirm={handleConfirmCancel}
                title="ยกเลิกคิวของคุณ?"
                description="หากยกเลิกคิวแล้ว คุณจะต้องทำการจองคิวใหม่อีกครั้ง"
            />
        </div>
        <Footer />
    </div>
  );
}
