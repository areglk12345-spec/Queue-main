import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // 1. ดึงข้อมูลคิวปัจจุบัน (ดึงคอลัมน์ meeting_target มาแทน)
    const [callingRows] = await pool.query(
      "SELECT queue_number, name, meeting_target FROM queues WHERE DATE(created_at) = ? AND status = 'calling' ORDER BY updated_at DESC LIMIT 1",
      [today]
    );

    let current = { queue_number: '---', visitor: '-', agency: '-' };
    if (callingRows.length > 0) {
        const row = callingRows[0];
        current = {
            queue_number: row.queue_number,
            visitor: row.name,
            agency: row.meeting_target || "-" // ส่งชื่อหน่วยงานไปแสดงผลแทนประเภท
        };
    }

    // 2. ดึงข้อมูล 20 คิวถัดไป (ดึงคอลัมน์ meeting_target มาแทน)
    const [waitingRows] = await pool.query(
      "SELECT queue_number, name, meeting_target FROM queues WHERE DATE(created_at) = ? AND status = 'waiting' ORDER BY id ASC LIMIT 10",
      [today]
    );

    const nextQueues = waitingRows.map(row => {
        return {
            queue_number: row.queue_number,
            visitor: row.name,
            agency: row.meeting_target || "-" // ส่งชื่อหน่วยงานไปแสดงผลแทนประเภท
        };
    });

    return NextResponse.json({
      current,
      nextQueues
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}