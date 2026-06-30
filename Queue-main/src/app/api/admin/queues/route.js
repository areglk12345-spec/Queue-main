import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

export async function GET(request) {
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

    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await pool.query(
      "SELECT * FROM queues WHERE DATE(created_at) = ? ORDER BY id ASC",
      [today]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
