"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ShowQueuePage() {
  const [data, setData] = useState({
    current: { queue_number: "---", visitor: "-", agency: "-" },
    nextQueues: []
  });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/queue/display");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // ล็อกขนาดไว้ที่ 10 ช่อง แนวตั้งคอลัมน์เดี่ยวตามลิมิต 10 คิว
  const paddedQueues = Array.from({ length: 10 }, (_, index) => {
    if (index < data.nextQueues.length) {
      return data.nextQueues[index];
    }
    return { queue_number: "---", visitor: "-", agency: "-" };
  });

  return (
    <div className="page-background">
      
      {/* แทรก CSS แบบปลอดภัยเพื่อไม่ให้เกิดปัญหา Hydration Mismatch */}
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          background-color: #e8ecfb !important;
          background-image: none !important;
          padding: 0 !important;
          margin: 0 !important;
          display: block !important;
          overflow-y: auto !important;
        }
        .page-background {
          background-color: #e8ecfb;
          min-height: 100vh;
          width: 100%;
          padding: 40px 30px;
          display: flex;
          justify-content: center;
          font-family: 'Prompt', sans-serif;
          box-sizing: border-box;
        }
        .main-container {
          width: 100%;
          max-width: 1400px; 
          display: flex;
          flex-direction: column;
          gap: 35px;
        }
        
        /* ขนาดกรอบบล็อกหัวข้อหลัก (Header) */
        .page-header {
          background-color: white;
          border-radius: 20px;
          padding: 25px 50px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.05);
        }
        .title-section h1 {
          margin: 0;
          font-size: 52px;
          color: #444;
          font-weight: 700;
          letter-spacing: 1px;
        }
        
        /* ขนาดกรอบบล็อกหลักคิวปัจจุบัน (Cards) */
        .cards-row {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 35px;
        }
        .card {
          background-color: white;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.08);
          display: flex;
          flex-direction: column;
          min-height: 360px;
        }
        .card-header {
          padding: 22px;
          text-align: center;
          font-size: 34px;
          font-weight: 600;
          color: white;
        }
        .blue-bg {
          background-color: #4b61e6;
        }
        .card-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
        }
        .big-number {
          font-size: 190px;
          font-weight: 700;
          color: #444;
          letter-spacing: 5px;
          line-height: 1;
        }
        .big-agency {
          font-size: 90px;
          font-weight: 600;
          color: #444;
          text-align: center;
          line-height: 1.2;
        }
        
        /* โครงสร้างตารางคิวถัดไปแนวตั้ง */
        .next-queue-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .next-queue-title {
          margin: 0;
          font-size: 32px;
          color: #333;
          font-weight: 600;
          padding-left: 5px;
        }
        .table-wrapper {
          background-color: white;
          border-radius: 25px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }
        .next-queue-table {
          width: 100%;
          border-collapse: collapse;
        }
        .next-queue-table thead tr {
          background-color: #cbd5f0;
        }
        .next-queue-table th {
          padding: 20px 30px;
          color: #555;
          font-size: 28px;
          font-weight: 600;
        }
        .next-queue-table td {
          padding: 18px 30px;
          border-bottom: 1px solid #eef2f6;
          height: 90px; 
          vertical-align: middle;
        }
        .center-text {
          text-align: center;
        }
        .queue-text {
          font-weight: 700;
        }
        @media (max-width: 1024px) {
          .cards-row {
            grid-template-columns: 1fr;
          }
          .big-number { font-size: 140px; }
          .big-agency { font-size: 70px; }
        }
      `}} />

      <div className="main-container">
        
        {/* Header Section */}
        <header className="page-header">
          <div className="logo-section" style={{ position: "relative", height: "90px", width: "180px" }}>
            <Image 
                src="/images/logo_ncsa.png" 
                alt="NCSA Logo" 
                fill 
                style={{ objectFit: "contain" }} 
                priority
            />
          </div>
          <div className="title-section">
            <h1>สถานะการเรียกคิว</h1>
          </div>
        </header>

        {/* Current Queue Cards Row */}
        <div className="cards-row">
          <div className="card">
            <div className="card-header blue-bg">
              หมายเลขคิวปัจจุบัน
            </div>
            <div className="card-body">
              <span className="big-number">{data.current.queue_number}</span>
            </div>
          </div>

          <div className="card">
            <div className="card-header blue-bg">
              ชื่อหน่วยงาน/ชื่อผู้ลงทะเบียน
            </div>
            <div className="card-body" style={{ flexDirection: "column", gap: "10px" }}>
              <span className="big-agency">{data.current.visitor}</span>
              <span style={{ fontSize: "38px", color: "#666", fontWeight: 500 }}>({data.current.agency})</span>
            </div>
          </div>
        </div>

        {/* Next Queue Section (ปรับโครงสร้างเป็น 3 คอลัมน์เรียงแถวแนวตั้งยาวลงมา) */}
        <div className="next-queue-container">
          <h2 className="next-queue-title">คิวถัดไป (Next Queue)</h2>
          
          <div className="table-wrapper">
            <table className="next-queue-table">
              <thead>
                <tr>
                  <th style={{ width: "20%", textAlign: "center" }}>คิวถัดไป</th>
                  <th style={{ width: "40%", textAlign: "center" }}>ชื่อหน่วยงาน</th>
                  <th style={{ width: "40%", textAlign: "center" }}>ชื่อผู้ลงทะเบียน</th>
                </tr>
              </thead>
              <tbody>
                {paddedQueues.map((q, index) => (
                  <tr key={index}>
                    {/* คอลัมน์ที่ 1: หมายเลขคิว */}
                    <td className="center-text queue-text" style={{ fontSize: "40px", color: q.queue_number === "---" ? "#ccc" : "#4b61e6" }}>
                      {q.queue_number}
                    </td>
                    
                    {/* คอลัมน์ที่ 2: หน่วยงาน */}
                    <td className="center-text queue-text" style={{ fontSize: "30px", fontWeight: "600", color: q.agency === "-" ? "#ccc" : "#333" }}>
                      {q.agency}
                    </td>
                    
                    {/* คอลัมน์ที่ 3: ชื่อผู้ลงทะเบียน (ขยับมาทางขวาเพื่อแชร์พื้นที่ว่าง) */}
                    <td className="center-text queue-text" style={{ fontSize: "30px", fontWeight: "500", color: q.visitor === "-" ? "#ccc" : "#666" }}>
                      {q.visitor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}