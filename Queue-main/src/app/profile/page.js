"use client";
import { useState } from "react";
import Image from "next/image";

export default function ProfilePage() {
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("TH");

  return (
    <div style={{ backgroundColor: "#fff", position: "relative", flex: 1 }}>
      {/* Red Header Background */}
      <div style={{ backgroundColor: "#79080e", height: "78px", width: "100%", position: "absolute", top: 0, left: 0, zIndex: 1 }}></div>

      {/* Profile Content */}
      <div style={{ position: "relative", zIndex: 2, marginTop: "48px", background: "white", borderTopLeftRadius: "30px", borderTopRightRadius: "30px", padding: "0 18px 22px 18px", display: "flex", flexDirection: "column", alignItems: "center", minHeight: "calc(100vh - 78px)" }}>
        {/* Profile Picture */}
        <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: "4px solid #df0101", marginTop: "-50px", background: "white", overflow: "hidden", marginBottom: "16px", position: "relative" }}>
          <Image src="/images/logo_ncsa.png" alt="Profile" fill style={{ objectFit: "cover" }} />
        </div>

        <div style={{ fontSize: "22px", fontWeight: 500, color: "#222", marginBottom: "4px" }}>ผู้ใช้งาน NCSA</div>
        <div style={{ fontSize: "13px", color: "#666", marginBottom: "40px" }}>08X-XXX-XXXX</div>

        {/* Menu List */}
        <div style={{ width: "100%", marginBottom: "50px" }}>
          <div className="menu-item">
            <span>คำถามที่พบบ่อย</span>
            <i className="fa-solid fa-chevron-right"></i>
          </div>
          <div className="menu-item">
            <span>ข้อกำหนดและเงื่อนไข</span>
            <i className="fa-solid fa-chevron-right"></i>
          </div>
          <div className="menu-item" onClick={() => setLangOpen(!langOpen)}>
            <span>ภาษา</span>
            <div className="lang-dropdown">
              <span>{currentLang}</span>
              <i className="fa-solid fa-chevron-down" style={{ transition: "transform 0.3s", transform: langOpen ? "rotate(180deg)" : "rotate(0)" }}></i>
            </div>
          </div>
          {langOpen && (
            <div style={{ background: "#f9f9f9", borderRadius: "8px", overflow: "hidden", marginTop: "4px", marginBottom: "4px" }}>
              <div style={{ padding: "12px 16px", cursor: "pointer", fontSize: "14px", color: currentLang === "TH" ? "#4361ee" : "#444", fontWeight: currentLang === "TH" ? 600 : 400, borderBottom: "1px solid #eee" }} onClick={() => { setCurrentLang("TH"); setLangOpen(false); }}>
                🇹🇭 ไทย
              </div>
              <div style={{ padding: "12px 16px", cursor: "pointer", fontSize: "14px", color: currentLang === "EN" ? "#4361ee" : "#444", fontWeight: currentLang === "EN" ? 600 : 400 }} onClick={() => { setCurrentLang("EN"); setLangOpen(false); }}>
                🇬🇧 English
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button className="logout-btn">ออกจากระบบ</button>
      </div>
    </div>
  );
}
