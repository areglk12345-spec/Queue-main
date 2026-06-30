import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lineUserId = searchParams.get('lineUserId');

    if (!lineUserId) {
        return NextResponse.json({ active: false });
    }

    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await pool.query(
      "SELECT id FROM queues WHERE line_user_id = ? AND DATE(created_at) = ? AND status IN ('waiting', 'calling') ORDER BY created_at DESC LIMIT 1",
      [lineUserId, today]
    );

    if (rows.length > 0) {
        return NextResponse.json({ active: true, id: rows[0].id });
    }

    return NextResponse.json({ active: false });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
