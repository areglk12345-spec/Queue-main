import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendReplyMessage } from '@/lib/line';

export async function POST(request) {
    try {
        const body = await request.json();
        const events = body.events;

        for (const event of events) {
            if (event.type === 'message' && event.message.type === 'text') {
                const text = event.message.text.trim();
                const userId = event.source.userId;
                const replyToken = event.replyToken;

                if (text === 'ตรวจสอบคิว' || text === 'เช็คคิว') {
                    await handleCheckQueue(userId, replyToken);
                } else if (text === 'ยกเลิกคิว') {
                    await handleCancelQueue(userId, replyToken);
                } else if (text === 'จองคิว') {
                    await handleBookQueue(replyToken);
                } else if (text === 'รูป' || text === 'รูปภาพ') {
                    // เพิ่มเงื่อนไขจับคำว่า "รูป" หรือ "รูปภาพ"
                    await handlePhotoRequest(replyToken);
                } else {
                    await handleDefault(replyToken);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Webhook error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// --- ฟังก์ชันใหม่สำหรับส่งลิงก์รูปภาพ ---
async function handlePhotoRequest(replyToken) {
    // ⚠️ สำคัญ: อย่าลืมเปลี่ยนตรงนี้เป็นลิงก์ Google Drive ของคุณเองนะครับ (และเปิดสิทธิ์แชร์ลิงก์เป็นแบบสาธารณะ)
    const googleDriveLink = "https://drive.google.com/drive/folders/xxxxxxxxxxxxxxx"; 

    await sendReplyMessage(replyToken, [
        {
            type: "text",
            text: `📸 สามารถดูและดาวน์โหลดรูปภาพจากกิจกรรมได้ที่ลิงก์นี้เลยค่ะ 👇\n\n🔗 ${googleDriveLink}`
        }
    ]);
}
// ------------------------------------

// --- ฟังก์ชันใหม่สำหรับส่งปุ่มจองคิว ---
async function handleBookQueue(replyToken) {
    await sendReplyMessage(replyToken, [
        {
            type: "template",
            altText: "กรุณากดปุ่มเพื่อจองคิว",
            template: {
                type: "buttons",
                text: "คลิกปุ่มด้านล่างเพื่อเปิดหน้าเว็บจองคิวได้เลยค่ะ 👇",
                actions: [
                    {
                        type: "uri",
                        label: "เข้าสู่หน้าจองคิว",
                        // ⚠️ สำคัญ: อย่าลืมเปลี่ยนตรงนี้เป็นลิงก์ LIFF ของคุณเองนะครับ
                        uri: "https://liff.line.me/2010101761-EJ0ANt4E" 
                    }
                ]
            }
        }
    ]);
}
// ------------------------------------

async function handleCheckQueue(userId, replyToken) {
    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await pool.query(
        "SELECT * FROM queues WHERE line_user_id = ? AND DATE(created_at) = ? AND status IN ('waiting', 'calling') ORDER BY created_at DESC LIMIT 1",
        [userId, today]
    );

    if (rows.length === 0) {
        return await sendReplyMessage(replyToken, [
            { type: 'text', text: '❌ คุณยังไม่มีคิวที่กำลังรออยู่ในขณะนี้ค่ะ' }
        ]);
    }

    const queue = rows[0];
    const statusText = queue.status === 'calling' ? '📣 กำลังเรียกพบ' : '⏳ กำลังรอคิว';

    // Count waiting in front
    const [waitingRows] = await pool.query(
        "SELECT COUNT(*) as count FROM queues WHERE DATE(created_at) = ? AND status = 'waiting' AND id < ?",
        [today, queue.id]
    );

    await sendReplyMessage(replyToken, [
        {
            type: 'text',
            text: `📍 ข้อมูลคิวของคุณ\n\nหมายเลข: ${queue.queue_number}\nสถานะ: ${statusText}\nรออีก: ${waitingRows[0].count} คิว\n\nสามารถดูรายละเอียดเพิ่มเติมได้ที่หน้าเว็บค่ะ`
        }
    ]);
}

async function handleCancelQueue(userId, replyToken) {
    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await pool.query(
        "SELECT id, queue_number FROM queues WHERE line_user_id = ? AND DATE(created_at) = ? AND status = 'waiting' ORDER BY created_at DESC LIMIT 1",
        [userId, today]
    );

    if (rows.length === 0) {
        return await sendReplyMessage(replyToken, [
            { type: 'text', text: '❌ ไม่พบคิวที่สามารถยกเลิกได้ในขณะนี้ค่ะ' }
        ]);
    }

    await pool.query(
        "UPDATE queues SET status = 'cancelled' WHERE id = ?",
        [rows[0].id]
    );

    await sendReplyMessage(replyToken, [
        {
            type: 'text',
            text: `🗑️ ยกเลิกคิวหมายเลข ${rows[0].queue_number} เรียบร้อยแล้วค่ะ`
        }
    ]);
}

async function handleDefault(replyToken) {
    await sendReplyMessage(replyToken, [
        {
            type: 'text',
            // อัปเดตข้อความต้อนรับให้มีคำสั่ง "รูป" ด้วย
            text: 'สวัสดีค่ะ 🙏 ยินดีต้อนรับสู่ระบบจองคิว\n\nคุณสามารถพิมพ์คำสั่งดังนี้:\n- "จองคิว" เพื่อเปิดหน้าจองคิว\n- "ตรวจสอบคิว" เพื่อเช็คคิวของคุณ\n- "ยกเลิกคิว" เพื่อยกเลิกคิวปัจจุบัน\n- "รูป" เพื่อดูรูปภาพกิจกรรมค่ะ'
        }
    ]);
}