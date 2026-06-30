import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendPushMessage } from '@/lib/line';

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, meetingTarget, agencyType, agencyOther, paxType, paxOther, contact, lineUserId } = data;

    // Basic validation
    if (!name || !meetingTarget || !agencyType || !paxType || !contact) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);
    let queueNumber;
    let insertId;

    // --- เริ่มระบบ Transaction และ Locking ป้องกันคิวซ้ำ/คิวข้าม ---
    const connection = await pool.getConnection(); // ขอ Connection แยกมาเพื่อทำ Transaction
    try {
        await connection.beginTransaction(); // เริ่มต้นบล็อกการทำงาน (ห้ามใครแทรก)

        // 1. ดึงเลขคิวล่าสุดของวันนี้เท่านั้น (ใช้ LIMIT 1 เพื่อเอาคนที่ล่าสุดจริงๆ)
        // สั่ง FOR UPDATE คือการ "ล็อก" ไม่ให้คนอื่นเข้ามาอ่านเลขคิวจนกว่าคนแรกจะบันทึกเสร็จ
        const [rows] = await connection.query(
            'SELECT queue_number FROM queues WHERE DATE(created_at) = ? ORDER BY id DESC LIMIT 1 FOR UPDATE',
            [today]
        );

        // 2. คำนวณเลขคิวถัดไป
        let nextNum = 1;
        if (rows.length > 0) {
            // เอาเลขคิวล่าสุด (เช่น "004") มาแปลงเป็นตัวเลขแล้วบวก 1
            nextNum = parseInt(rows[0].queue_number, 10) + 1;
        }
        queueNumber = String(nextNum).padStart(3, '0'); // แปลงกลับเป็น "005"

        // 3. บันทึกข้อมูลลงฐานข้อมูล
        const [result] = await connection.query(
            `INSERT INTO queues (queue_number, name, meeting_target, agency_type, agency_other, pax_type, pax_other, contact, line_user_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'waiting')`,
            [queueNumber, name, meetingTarget, agencyType, agencyOther, paxType, paxOther || null, contact, lineUserId || null]
        );
        insertId = result.insertId;

        // 4. บันทึกสำเร็จ ยืนยันการทำงานและปลดล็อกฐานข้อมูล (Commit)
        await connection.commit();
    } catch (dbError) {
        // ถ้าระหว่างทางมี Error (เช่น ฐานข้อมูลหลุด) ให้ดึงข้อมูลทั้งหมดกลับ (Rollback) เลขคิวจะได้ไม่ข้าม
        await connection.rollback();
        throw dbError; // โยน Error ออกไปให้ Catch ตัวนอกจัดการต่อ
    } finally {
        // สำคัญมาก: คืน Connection ให้ระบบ (ไม่งั้นเซิร์ฟเวอร์จะค้าง)
        connection.release();
    }
    // --- จบระบบ Transaction ---

    // Create a notification for successful booking
    await pool.query(
      'INSERT INTO notifications (queue_id, title, message) VALUES (?, ?, ?)',
      [insertId, "จองคิวสำเร็จ", `หมายเลขคิวของคุณคือ ${queueNumber} กรุณารอเรียกคิวตามลำดับ`]
    );

    // Send LINE Push Notification
    if (lineUserId) {
        let agencyLabel = "อื่นๆ";
        if (agencyType === "cii") agencyLabel = "CII";
        else if (agencyType === "regulator") agencyLabel = "Regulator";
        else if (agencyType === "gov") agencyLabel = "ภาครัฐ";
        else if (agencyType === "other") agencyLabel = agencyOther;

        const paxLabel = paxType === "more" ? `${paxOther} ท่าน` : `${paxType} ท่าน`;

        await sendPushMessage(lineUserId, [
            {
                type: 'text',
                text: `✅ จองคิวสำเร็จ!\n\n🎫 หมายเลขคิว: *${queueNumber}*\n\n👤 ชื่อผู้จอง: ${name}\n🏢 หน่วยงาน: ${agencyLabel}\n👥 จำนวน: ${paxLabel}\n\nกรุณารอรับการแจ้งเตือนเมื่อใกล้ถึงคิวของคุณค่ะ`
            }
        ]);
    }

    return NextResponse.json({
      success: true,
      id: insertId,
      queueNumber,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}