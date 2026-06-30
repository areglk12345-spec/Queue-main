export default function Announcement() {
  return (
    <div style={{ background: "white", borderRadius: "8px", padding: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "12px" }}>
            <i className="fa-solid fa-bullhorn" style={{ color: "#4361ee", fontSize: "16px", marginRight: "10px", marginTop: "2px" }}></i>
            <h3 style={{ fontSize: "15px", color: "#444", fontWeight: 600 }}>ประกาศ/แจ้งเตือน</h3>
        </div>
        <div style={{ paddingLeft: "26px" }}>
            <p style={{ fontSize: "12px", color: "#555", lineHeight: 1.8, marginBottom: "2px" }}>กรุณามาถึงก่อนเวลานัดหมายอย่างน้อย 30 นาที</p>
            <p style={{ fontSize: "12px", color: "#555", lineHeight: 1.8 }}>หากไม่สามารถมาตามนัดหมายกรุณายกเลิกคิวล่วงหน้า</p>
        </div>
    </div>
  );
}
