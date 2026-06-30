import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendPushMessage } from '@/lib/line'; // <-- 1. เพิ่มการ Import ฟังก์ชันส่ง LINE

export async function PATCH(request) {
  try {
    const { id, lineUserId } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    // ดึงข้อมูลทั้ง line_user_id และ queue_number เพื่อเอาไปใช้ส่งแจ้งเตือน
    const [rows] = await pool.query(
        "SELECT line_user_id, queue_number FROM queues WHERE id = ?",
        [id]
    );

    if (rows.length === 0) {
        return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
    }

    const storedLineId = rows[0].line_user_id;
    const queueNumber = rows[0].queue_number;

    // Security check
    //if (storedLineId && storedLineId !== lineUserId) {
      //  return NextResponse.json({ error: 'Unauthorized: You do not own this queue' }, { status: 403 });
    //}

    // อัปเดตสถานะเป็นยกเลิก
    await pool.query(
      "UPDATE queues SET status = 'cancelled' WHERE id = ?",
      [id]
    );

    // --- 2. เพิ่มส่วนการสร้างการแจ้งเตือน ---
    
    // บันทึกลงตาราง notifications สำหรับแสดงในหน้าเว็บ
    await pool.query(
        "INSERT INTO notifications (queue_id, title, message) VALUES (?, ?, ?)",
        [id, "ยกเลิกคิวสำเร็จ", `คุณได้ยกเลิกคิวหมายเลข ${queueNumber} ผ่านทางหน้าเว็บเรียบร้อยแล้ว`]
    );

    // ส่งข้อความแจ้งเตือนผ่าน LINE
    if (storedLineId) {
        await sendPushMessage(storedLineId, [
            {
                type: 'text',
                text: `🗑️ ยกเลิกคิวสำเร็จ\n\nระบบได้ทำการยกเลิกคิวหมายเลข *${queueNumber}* ตามที่คุณทำรายการผ่านหน้าเว็บเรียบร้อยแล้วค่ะ`
            }
        ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}