"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLiff } from "@/components/providers/LiffProvider";
import Footer from "@/components/layout/Footer";

const agencyOptions = [
  { label: "CII", value: "cii" },
  { label: "Regulator", value: "regulator" },
  { label: "ภาครัฐ", value: "gov" },
  { label: "อื่นๆ", value: "other" },
];

const paxOptions = [
  ...Array.from({ length: 10 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}` })),
  { label: "มากกว่า 10 คน", value: "more" },
];

export default function BookingPage() {
  const router = useRouter();
  const { liff, isInitialized } = useLiff();
  
  const [name, setName] = useState("");
  const [meetingTarget, setMeetingTarget] = useState("");
  const [agencyType, setAgencyType] = useState("");
  const [agencyOther, setAgencyOther] = useState("");
  const [paxType, setPaxType] = useState("");
  const [paxOther, setPaxOther] = useState("");
  const [contact, setContact] = useState("");
  const [lineUserId, setLineUserId] = useState(null);
  
  const [agencyOpen, setAgencyOpen] = useState(false);
  const [paxOpen, setPaxOpen] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if already has a queue
  useEffect(() => {
    const queueId = localStorage.getItem("myQueueId");
    if (queueId) {
        router.replace('/queue/result');
    }
  }, [router]);

  // Fetch profile when LIFF is ready
  useEffect(() => {
    if (isInitialized && liff) {
        if (liff.isLoggedIn()) {
            liff.getProfile().then(profile => {
                setLineUserId(profile.userId);
            }).catch(err => console.error("Profile error:", err));
        } else {
            // บังคับล็อกอินถ้าเปิดบนคอมพิวเตอร์
            liff.login();
        }
    }
  }, [isInitialized, liff]);

  const shakeField = (fieldId) => {
    setErrors((prev) => ({ ...prev, [fieldId]: true }));
    setTimeout(() => setErrors((prev) => ({ ...prev, [fieldId]: false })), 400);
  };

  const handleSubmit = async () => {
    if (!name.trim()) { shakeField("name"); return; }
    if (!meetingTarget.trim()) { shakeField("meetingTarget"); return; }
    if (!agencyType) { shakeField("agency"); return; }
    if (agencyType === "other" && !agencyOther.trim()) { shakeField("agencyOther"); return; }
    if (!paxType) { shakeField("pax"); return; }
    if (paxType === "more" && (!paxOther || Number(paxOther) < 1)) { shakeField("paxOther"); return; }
    
    // Strict 10 digit check
    if (!contact.trim() || contact.length !== 10 || !/^\d+$/.test(contact)) { 
        shakeField("contact"); 
        return; 
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/queue/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          meetingTarget: meetingTarget.trim(),
          agencyType,
          agencyOther: agencyOther.trim(),
          paxType,
          paxOther: paxOther || paxType,
          contact: contact.trim(),
          lineUserId: lineUserId
        }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("myQueueId", data.id);
        router.replace("/queue/result");
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการจองคิว");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="app-container">
        <div id="booking-view" className="view-container active" style={{ background: "#eef0f8" }}>
            <div style={{ background: "white", borderBottomLeftRadius: "24px", borderBottomRightRadius: "24px", padding: "22px 20px 18px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div onClick={() => router.replace('/')} style={{ cursor: 'pointer', padding: '10px', marginLeft: '-10px', display: 'flex', alignItems: 'center' }}>
                        <i className="fa-solid fa-chevron-left" style={{ color: "#444", fontSize: "20px" }}></i>
                    </div>
                    <div>
                        <h2 style={{ color: "#444", fontWeight: 600, fontSize: "18px", lineHeight: 1.2 }}>กรอกข้อมูลการจอง</h2>
                    </div>
                </div>
            </div>

            <div style={{ padding: "0 20px 24px" }}>
                <div style={{ background: "white", borderRadius: "8px", padding: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
                    <div className="form-group" style={{ marginBottom: "18px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#444", marginBottom: "8px" }}>ชื่อ-นามสกุลผู้เข้าพบ <span style={{ color: "#d9141b" }}>*</span></label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="กรอกชื่อ-สกุล" style={{ width: "100%", padding: "13px 16px", border: `1px solid ${errors.name ? "#d9141b" : "#e2e6f3"}`, borderRadius: "12px", fontSize: "14px", outline: "none", background: "#fff", color: "#444", animation: errors.name ? "shake 0.4s" : "none" }} />
                    </div>

                    <div className="form-group" style={{ marginBottom: "18px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#444", marginBottom: "8px" }}>ชื่อหน่วยงาน/บุคคลที่ต้องการเข้าพบ <span style={{ color: "#d9141b" }}>*</span></label>
                        <input type="text" value={meetingTarget} onChange={(e) => setMeetingTarget(e.target.value)} placeholder="ระบุชื่อหน่วยงานหรือบุคคล" style={{ width: "100%", padding: "13px 16px", border: `1px solid ${errors.meetingTarget ? "#d9141b" : "#e2e6f3"}`, borderRadius: "12px", fontSize: "14px", outline: "none", background: "#fff", color: "#444", animation: errors.meetingTarget ? "shake 0.4s" : "none" }} />
                    </div>

                    <div className="form-group" style={{ marginBottom: "18px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#444", marginBottom: "8px" }}>ประเภทหน่วยงานที่เข้าพบ <span style={{ color: "#d9141b" }}>*</span></label>
                        <div className="custom-select" data-id="agency">
                            <div className={`select-selected ${agencyOpen ? "active" : ""}`} onClick={() => setAgencyOpen(!agencyOpen)} style={{ animation: errors.agency ? "shake 0.4s" : "none", borderColor: errors.agency ? "#d9141b" : "" }}>
                                <span style={{ color: agencyType ? "#333" : "#999" }}>{agencyType ? agencyOptions.find(o => o.value === agencyType)?.label : "เลือกประเภทหน่วยงาน"}</span>
                                <i className="fa-solid fa-chevron-down" style={{ color: "#666", transition: "transform 0.3s", transform: agencyOpen ? "rotate(180deg)" : "rotate(0deg)" }}></i>
                            </div>
                            <div className={`select-items ${agencyOpen ? "" : "select-hide"}`}>
                                {agencyOptions.map(opt => (
                                <div key={opt.value} onClick={() => { setAgencyType(opt.value); setAgencyOpen(false); }}>{opt.label}</div>
                                ))}
                            </div>
                        </div>
                        {agencyType === 'other' && (
                        <input type="text" value={agencyOther} onChange={(e) => setAgencyOther(e.target.value)} placeholder="ระบุอื่นๆ" style={{ width: "100%", padding: "13px 16px", border: `1px solid ${errors.agencyOther ? "#d9141b" : "#e2e6f3"}`, borderRadius: "12px", fontSize: "14px", outline: "none", marginTop: "10px", background: "#fff", color: "#444", animation: errors.agencyOther ? "shake 0.4s" : "none" }} />
                        )}
                    </div>

                    <div className="form-group" style={{ marginBottom: "18px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#444", marginBottom: "8px" }}>จำนวนผู้เข้าพบ <span style={{ color: "#d9141b" }}>*</span></label>
                        <div className="custom-select" data-id="pax">
                            <div className={`select-selected ${paxOpen ? "active" : ""}`} onClick={() => setPaxOpen(!paxOpen)} style={{ animation: errors.pax ? "shake 0.4s" : "none", borderColor: errors.pax ? "#d9141b" : "" }}>
                                <span style={{ color: paxType ? "#333" : "#999" }}>{paxType ? paxOptions.find(o => o.value === paxType)?.label : "1"}</span>
                                <i className="fa-solid fa-chevron-down" style={{ color: "#666", transition: "transform 0.3s", transform: paxOpen ? "rotate(180deg)" : "rotate(0deg)" }}></i>
                            </div>
                            <div className={`select-items ${paxOpen ? "" : "select-hide"}`} style={{ maxHeight: "240px", overflowY: "auto" }}>
                                {paxOptions.map(opt => (
                                <div key={opt.value} onClick={() => { setPaxType(opt.value); setPaxOpen(false); }}>{opt.label}</div>
                                ))}
                            </div>
                        </div>
                        {paxType === 'more' && (
                        <input type="number" value={paxOther} onChange={(e) => setPaxOther(e.target.value)} placeholder="ระบุจำนวนคน" min="1" step="1" style={{ width: "100%", padding: "13px 16px", border: `1px solid ${errors.paxOther ? "#d9141b" : "#e2e6f3"}`, borderRadius: "12px", fontSize: "14px", outline: "none", marginTop: "10px", background: "#fff", color: "#444", animation: errors.paxOther ? "shake 0.4s" : "none" }} />
                        )}
                    </div>

                    <div className="form-group" style={{ marginBottom: "26px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#444", marginBottom: "8px" }}>เบอร์โทร / ช่องทางติดต่อ <span style={{ color: "#d9141b" }}>*</span></label>
                        <input type="tel" value={contact} onChange={(e) => setContact(e.target.value.replace(/\D/g, ''))} maxLength="10" placeholder="กรอกเบอร์โทร" style={{ width: "100%", padding: "13px 16px", border: `1px solid ${errors.contact ? "#d9141b" : "#e2e6f3"}`, borderRadius: "12px", fontSize: "14px", outline: "none", background: "#fff", color: "#444", animation: errors.contact ? "shake 0.4s" : "none" }} />
                        <p style={{ fontSize: "11px", color: errors.contact ? "#d9141b" : "#888", marginTop: "5px" }}>* กรุณากรอกเบอร์โทร 10 หลัก (ตัวเลขเท่านั้น)</p>
                    </div>

                    <button onClick={handleSubmit} disabled={isSubmitting} style={{ width: "100%", background: "#4361ee", color: "white", border: "none", padding: "14px 18px", borderRadius: "30px", fontSize: "15px", fontWeight: 500, fontFamily: "'Prompt', sans-serif", cursor: "pointer", boxShadow: "0 4px 10px rgba(67, 97, 238, 0.2)", marginBottom: "12px", opacity: isSubmitting ? 0.7 : 1 }}>
                        {isSubmitting ? "กำลังดำเนินการ..." : "ยืนยันการจอง"}
                    </button>
                </div>
            </div>
        </div>
        <Footer />
    </div>
  );
}