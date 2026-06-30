"use client";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");

  const fetchQueues = async () => {
    try {
      const res = await fetch("/api/admin/queues");
      if (res.status === 401) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setQueues(data);
      setIsAuthorized(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(() => {
        if (isAuthorized) fetchQueues();
    }, 10000);
    return () => clearInterval(interval);
  }, [isAuthorized]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        setIsAuthorized(true);
        fetchQueues();
      } else {
        const data = await res.json();
        if (data.error === '2FA not configured on server') {
            setLoginError(<span>ยังไม่ได้ตั้งค่า 2FA บนเซิร์ฟเวอร์ <a href="/api/admin/setup-2fa" style={{ color: "#d9141b", textDecoration: "underline" }}>คลิกที่นี่เพื่อตั้งค่า</a></span>);
        } else {
            setLoginError("รหัส PIN ไม่ถูกต้อง!");
        }
      }
    } catch (err) {
      setLoginError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setIsAuthorized(false);
      setPin("");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลคิวทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
      return;
    }

    try {
      const res = await fetch("/api/admin/queues/clear", { method: "POST" });
      if (res.ok) {
        alert("ล้างข้อมูลเรียบร้อยแล้ว");
        fetchQueues();
      } else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาดในการล้างข้อมูล");
      }
    } catch (err) {
      console.error("Clear data error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/queues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.status === 401) {
        setIsAuthorized(false);
        return;
      }
      fetchQueues();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "Prompt, sans-serif" }}>กำลังโหลด...</div>;
  }

  if (!isAuthorized) {
    return (
      <div style={{ background: "#f4f7f6", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Prompt, sans-serif", padding: "20px" }}>
        <div style={{ background: "white", padding: "40px", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px", textAlign: "center" }}>
          <div style={{ width: "80px", height: "80px", background: "#79080e", color: "white", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 24px" }}>
            <i className="fa-solid fa-lock"></i>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#333", marginBottom: "8px" }}>Admin Access</h1>
          <p style={{ color: "#666", marginBottom: "32px" }}>กรุณากรอกรหัส PIN 6 หลักจากแอพ 2FA</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="text" 
              inputMode="numeric" 
              maxLength={6} 
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "2px solid #eee", fontSize: "24px", textAlign: "center", letterSpacing: "8px", fontWeight: "700", marginBottom: "16px", outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => e.target.style.borderColor = "#79080e"}
              onBlur={(e) => e.target.style.borderColor = "#eee"}
            />
            {loginError && <p style={{ color: "#d9141b", fontSize: "14px", marginBottom: "16px" }}>{loginError}</p>}
            <button type="submit" style={{ width: "100%", background: "#79080e", color: "white", border: "none", padding: "16px", borderRadius: "12px", fontSize: "16px", fontWeight: "600", cursor: "pointer", transition: "opacity 0.2s" }}>
              ยืนยันรหัส PIN
            </button>
          </form>
          <p style={{ marginTop: "24px", fontSize: "12px", color: "#999" }}>NCSA Queue Management System</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f4f7f6", minHeight: "100vh", width: "100%", padding: "40px", fontFamily: "Prompt, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Modern Header */}
        <div style={{ background: "linear-gradient(90deg, #79080e 0%, #bd0a10 100%)", padding: "30px 40px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(189, 10, 16, 0.2)", marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "white" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "700", letterSpacing: "-0.5px" }}>Queue Management Dashboard</h1>
            <p style={{ margin: "8px 0 0", opacity: "0.9", fontSize: "16px" }}>National Cyber Security Agency (NCSA) Portal</p>
          </div>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button onClick={handleClearData} style={{ background: "white", color: "#d9141b", border: "none", padding: "12px 24px", borderRadius: "12px", cursor: "pointer", fontWeight: "700", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.2s" }}>
                <i className="fa-solid fa-trash-can" style={{ marginRight: "10px" }}></i> ล้างข้อมูลทั้งหมด
            </button>
            <button onClick={fetchQueues} style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)", padding: "12px 24px", borderRadius: "12px", cursor: "pointer", fontWeight: "600", backdropFilter: "blur(10px)", transition: "all 0.2s" }}>
                <i className="fa-solid fa-rotate" style={{ marginRight: "10px" }}></i> รีเฟรชข้อมูล
            </button>
            <button onClick={handleLogout} style={{ background: "rgba(0,0,0,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.1)", padding: "12px 24px", borderRadius: "12px", cursor: "pointer", fontWeight: "600", backdropFilter: "blur(10px)", transition: "all 0.2s" }}>
                <i className="fa-solid fa-right-from-bracket" style={{ marginRight: "10px" }}></i> ออกจากระบบ
            </button>
          </div>
        </div>

        {/* Big Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginBottom: "40px" }}>
            <BigStatCard label="รอรับบริการ" count={queues.filter(q => q.status === 'waiting').length} color="#4361ee" icon="fa-clock" />
            <BigStatCard label="กำลังเรียกพบ" count={queues.filter(q => q.status === 'calling').length} color="#24c31a" icon="fa-bullhorn" />
            <BigStatCard label="เสร็จสิ้นวันนี้" count={queues.filter(q => q.status === 'completed').length} color="#666" icon="fa-circle-check" />
            <BigStatCard label="ยกเลิก/ข้าม" count={queues.filter(q => q.status === 'cancelled').length} color="#d9141b" icon="fa-circle-xmark" />
        </div>

        {/* Main Content Table */}
        <div style={{ background: "white", borderRadius: "24px", boxShadow: "0 4px 25px rgba(0,0,0,0.05)", overflowX: "auto", border: "1px solid #edf2f7" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "900px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "2px solid #edf2f7" }}>
                <th style={{ padding: "20px 25px", color: "#64748b", fontWeight: "600", fontSize: "14px", textTransform: "uppercase" }}>หมายเลขคิว</th>
                <th style={{ padding: "20px 25px", color: "#64748b", fontWeight: "600", fontSize: "14px", textTransform: "uppercase" }}>ข้อมูลผู้จอง</th>
                <th style={{ padding: "20px 25px", color: "#64748b", fontWeight: "600", fontSize: "14px", textTransform: "uppercase" }}>หน่วยงาน</th>
                <th style={{ padding: "20px 25px", color: "#64748b", fontWeight: "600", fontSize: "14px", textTransform: "uppercase" }}>จำนวนผู้พบ</th>
                <th style={{ padding: "20px 25px", color: "#64748b", fontWeight: "600", fontSize: "14px", textTransform: "uppercase" }}>สถานะ</th>
                <th style={{ padding: "20px 25px", color: "#64748b", fontWeight: "600", fontSize: "14px", textTransform: "uppercase", textAlign: "right" }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {queues.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: "center", padding: "100px", color: "#64748b", fontSize: "18px" }}>ไม่พบข้อมูลการจองคิวในวันนี้</td></tr>
              ) : (
                queues.map((q) => (
                  <tr key={q.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} className="admin-tr-hover">
                    <td style={{ padding: "20px 25px" }}>
                        <span style={{ background: q.status === 'calling' ? '#e8fced' : '#f1f5f9', color: q.status === 'calling' ? '#24c31a' : '#334155', padding: "8px 16px", borderRadius: "12px", fontWeight: "800", fontSize: "22px", border: q.status === 'calling' ? '2px solid #24c31a' : '1px solid #e2e8f0' }}>
                            {q.queue_number}
                        </span>
                    </td>
                    <td style={{ padding: "20px 25px" }}>
                      <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>{q.name}</div>
                      <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}><i className="fa-solid fa-phone" style={{ marginRight: "5px" }}></i> {q.contact}</div>
                    </td>
                    <td style={{ padding: "20px 25px" }}>
                      <div style={{ fontWeight: "600", color: "#334155" }}>
                        {q.agency_type === 'cii' ? 'CII' : 
                         q.agency_type === 'regulator' ? 'Regulator' : 
                         q.agency_type === 'gov' ? 'หน่วยงานภาครัฐ' : 
                         q.agency_type === 'other' ? q.agency_other : 'อื่นๆ'}
                      </div>
                    </td>
                    <td style={{ padding: "20px 25px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155", fontWeight: "600" }}>
                            <i className="fa-solid fa-users" style={{ color: "#94a3b8" }}></i> {q.pax_type === 'more' ? q.pax_other : q.pax_type} ท่าน
                        </div>
                    </td>
                    <td style={{ padding: "20px 25px" }}>
                      <StatusBadge status={q.status} />
                    </td>
                    <td style={{ padding: "20px 25px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        {q.status === 'waiting' && (
                          <ActionButton label="เรียกคิว" color="#24c31a" icon="fa-bullhorn" onClick={() => updateStatus(q.id, 'calling')} />
                        )}
                        {q.status === 'calling' && (
                          <ActionButton label="เสร็จสิ้น" color="#4361ee" icon="fa-check" onClick={() => updateStatus(q.id, 'completed')} />
                        )}
                        {(q.status === 'waiting' || q.status === 'calling') && (
                          <ActionButton label="ยกเลิกคิว" color="#ef4444" icon="fa-xmark" onClick={() => updateStatus(q.id, 'cancelled')} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", marginTop: "40px", color: "#94a3b8", fontSize: "14px" }}>
            &copy; 2026 NCSA Queue Management System | Integrated MySQL Backend
        </p>
      </div>
      
      <style jsx>{`
        .admin-tr-hover:hover {
            background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
}

function BigStatCard({ label, count, color, icon }) {
    return (
        <div style={{ background: "white", padding: "25px", borderRadius: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)", border: "1px solid #edf2f7", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "15px", background: `${color}15`, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                <i className={`fa-solid ${icon}`}></i>
            </div>
            <div>
                <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600", marginBottom: "5px" }}>{label}</div>
                <div style={{ fontSize: "32px", fontWeight: "800", color: "#1e293b", lineHeight: "1" }}>{count}</div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const config = {
        waiting: { label: "รอรับบริการ", color: "#4361ee", bg: "#eef2ff" },
        calling: { label: "กำลังเรียกพบ", color: "#24c31a", bg: "#e8fced" },
        completed: { label: "เสร็จสิ้น", color: "#64748b", bg: "#f1f5f9" },
        cancelled: { label: "ยกเลิกแล้ว", color: "#ef4444", bg: "#fef2f2" },
    };
    const { label, color, bg } = config[status] || config.waiting;
    return (
        <span style={{ padding: "6px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", color, background: bg, border: `1px solid ${color}20` }}>
            {label}
        </span>
    );
}

function ActionButton({ label, color, icon, onClick }) {
    return (
        <button 
            onClick={onClick}
            style={{ 
                background: color, color: "white", border: "none", padding: "10px 18px", 
                borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "700",
                display: "flex", alignItems: "center", gap: "8px", boxShadow: `0 4px 12px ${color}30`,
                transition: "transform 0.1s, filter 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
            onMouseOut={(e) => e.currentTarget.style.filter = "brightness(1)"}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.95)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
            <i className={`fa-solid ${icon}`}></i> {label}
        </button>
    );
}
