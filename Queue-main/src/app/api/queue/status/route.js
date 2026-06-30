import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Get current calling (first 'calling' or latest 'completed')
    const [callingRows] = await pool.query(
      "SELECT queue_number FROM queues WHERE DATE(created_at) = ? AND status = 'calling' ORDER BY updated_at DESC LIMIT 1",
      [today]
    );
    
    // If none are 'calling', get the last 'completed'
    let currentCalling = callingRows[0]?.queue_number;
    if (!currentCalling) {
        const [lastCompleted] = await pool.query(
            "SELECT queue_number FROM queues WHERE DATE(created_at) = ? AND status = 'completed' ORDER BY updated_at DESC LIMIT 1",
            [today]
        );
        currentCalling = lastCompleted[0]?.queue_number || '000';
    }

    // Get next (first 'waiting')
    const [nextRows] = await pool.query(
      "SELECT queue_number FROM queues WHERE DATE(created_at) = ? AND status = 'waiting' ORDER BY id ASC LIMIT 1",
      [today]
    );
    const nextQueue = nextRows[0]?.queue_number || '-';

    // Get total today
    const [totalRows] = await pool.query(
      "SELECT COUNT(*) as count FROM queues WHERE DATE(created_at) = ?",
      [today]
    );

    return NextResponse.json({
      current: currentCalling,
      next: nextQueue,
      total: totalRows[0].count,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
