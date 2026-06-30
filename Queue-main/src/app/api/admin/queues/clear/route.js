import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

export async function POST(request) {
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

    // Delete all rows from queues. notifications will be deleted via cascade.
    // We use DELETE FROM instead of TRUNCATE to respect foreign key cascades if needed,
    // although with MySQL and InnoDB, TRUNCATE usually fails if there are FKs.
    await pool.query("DELETE FROM queues");
    
    // Reset auto-increment
    await pool.query("ALTER TABLE queues AUTO_INCREMENT = 1");

    return NextResponse.json({ message: "ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว" });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'ไม่สามารถล้างข้อมูลได้' }, { status: 500 });
  }
}
