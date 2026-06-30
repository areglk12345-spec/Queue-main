import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const lineUserId = searchParams.get('lineUserId');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const [rows] = await pool.query(
      "SELECT * FROM queues WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
    }

    const queueData = rows[0];
    const isOwner = !queueData.line_user_id || queueData.line_user_id === lineUserId;

    // Mask sensitive data if not owner
    if (!isOwner) {
        queueData.name = queueData.name.charAt(0) + "***" + (queueData.name.length > 4 ? queueData.name.slice(-1) : "");
        queueData.contact = queueData.contact.slice(0, 3) + "****" + queueData.contact.slice(-3);
    }

    // Also get current calling to calculate wait
    const today = new Date().toISOString().slice(0, 10);
    const [callingRows] = await pool.query(
      "SELECT id FROM queues WHERE DATE(created_at) = ? AND status = 'calling' ORDER BY updated_at DESC LIMIT 1",
      [today]
    );
    const currentCallingId = callingRows[0]?.id || 0;
    
    // Count how many people are in front (waiting status and id < current id)
    // Actually, waiting status means they haven't been called.
    const [waitingRows] = await pool.query(
        "SELECT COUNT(*) as count FROM queues WHERE DATE(created_at) = ? AND status = 'waiting' AND id < ?",
        [today, id]
    );

    return NextResponse.json({
      ...rows[0],
      waitingCount: waitingRows[0].count,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
