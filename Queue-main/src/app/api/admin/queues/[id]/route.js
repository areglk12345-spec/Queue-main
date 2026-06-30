import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { sendPushMessage } from '@/lib/line';

export async function PATCH(request, { params }) {
  try {
    // Verify JWT
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-me');
        await jwtVerify(token, jwtSecret);
    } catch (err) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
    }

    // Update status
    await pool.query(
      "UPDATE queues SET status = ? WHERE id = ?",
      [status, id]
    );

    // Create internal notifications for different status changes
    const [rows] = await pool.query("SELECT line_user_id, queue_number FROM queues WHERE id = ?", [id]);
    
    if (status === 'calling') {
        await pool.query(
            "INSERT INTO notifications (queue_id, title, message) VALUES (?, ?, ?)",
            [id, "ถึงคิวของคุณแล้ว", `คิวหมายเลข ${rows[0]?.queue_number} กรุณาเชิญที่จุดให้บริการค่ะ`]
        );
        if (rows[0]?.line_user_id) {
            await sendPushMessage(rows[0].line_user_id, [
                {
                    type: 'text',
                    text: `🔔 ถึงคิวของคุณแล้ว!\n\nคิวหมายเลข: ${rows[0].queue_number}\nกรุณาเชิญที่จุดให้บริการค่ะ`
                }
            ]);
        }
    } else if (status === 'cancelled') {
        await pool.query(
            "INSERT INTO notifications (queue_id, title, message) VALUES (?, ?, ?)",
            [id, "คิวของคุณถูกยกเลิก", `คิวหมายเลข ${rows[0]?.queue_number} ถูกยกเลิกโดยผู้ดูแลระบบ`]
        );
        if (rows[0]?.line_user_id) {
            await sendPushMessage(rows[0].line_user_id, [
                {
                    type: 'text',
                    text: `❌ คิวของคุณถูกยกเลิก\n\nหมายเลขคิว: *${rows[0].queue_number}*\nถูกยกเลิกโดยผู้ดูแลระบบ\n\nหากมีข้อสงสัยกรุณาติดต่อเจ้าหน้าที่ค่ะ`
                }
            ]);
        }
    } else if (status === 'completed') {
        await pool.query(
            "INSERT INTO notifications (queue_id, title, message) VALUES (?, ?, ?)",
            [id, "การรับบริการเสร็จสิ้น", `คิวหมายเลข ${rows[0]?.queue_number} ได้รับการบริการเรียบร้อยแล้ว ขอบคุณที่ใช้บริการค่ะ`]
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
