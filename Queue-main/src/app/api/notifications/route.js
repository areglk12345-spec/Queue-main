import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const queueId = searchParams.get('queueId');

    if (!queueId) {
      return NextResponse.json({ error: 'queueId required' }, { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE queue_id = ? ORDER BY created_at DESC',
      [queueId]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { queueId } = await request.json();

    if (!queueId) {
      return NextResponse.json({ error: 'queueId required' }, { status: 400 });
    }

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE queue_id = ?',
      [queueId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
