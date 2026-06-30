import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    
    // สั่งลบข้อมูลคิวทั้งหมดของวันนี้
    await pool.query("DELETE FROM queues WHERE DATE(created_at) = ?", [today]);

    return NextResponse.json({ message: "ล้างข้อมูลคิวของวันนี้เรียบร้อยแล้ว" });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'ไม่สามารถล้างข้อมูลได้' }, { status: 500 });
  }
}