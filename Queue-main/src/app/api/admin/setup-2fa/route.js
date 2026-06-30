import { NextResponse } from 'next/server';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';

export async function GET() {
  // Use existing secret from .env or generate a temporary one for display
  let secret = process.env.ADMIN_TOTP_SECRET;
  let isNew = false;
  
  if (!secret) {
    secret = generateSecret();
    isNew = true;
  }

  const user = 'admin';
  const service = 'NCSA-Queue-Manager';
  const otpauth = generateURI({ 
    secret, 
    label: user, 
    issuer: service 
  });

  try {
    const qrCodeUrl = await QRCode.toDataURL(otpauth);
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
            <title>2FA Setup - NCSA Admin</title>
            <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Prompt', sans-serif; background: #f4f7f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                .card { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); text-align: center; max-width: 450px; width: 90%; }
                h1 { color: #79080e; margin-bottom: 10px; font-size: 24px; }
                p { color: #666; font-size: 14px; line-height: 1.6; }
                .qr-box { background: white; padding: 20px; border: 2px solid #eee; border-radius: 16px; margin: 20px auto; width: fit-content; }
                code { background: #f1f1f1; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: #333; font-size: 16px; }
                .alert { background: #fff5f5; color: #d9141b; padding: 15px; border-radius: 12px; margin-top: 20px; font-size: 13px; text-align: left; }
                .success-badge { display: inline-block; background: #e8fced; color: #24c31a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <div class="card">
                ${!isNew ? '<div class="success-badge">ตั้งค่าสำเร็จแล้ว</div>' : ''}
                <h1>ตั้งค่ารหัส 2FA (Admin)</h1>
                <p>ใช้แอป <b>Google Authenticator</b> หรือ <b>Authy</b> ในมือถือสแกน QR Code ด้านล่างนี้เพื่อรับรหัส PIN 6 หลัก</p>
                
                <div class="qr-box">
                    <img src="${qrCodeUrl}" style="width: 250px; height: 250px;" />
                </div>
                
                <p>หรือกรอกรหัส Secret นี้ด้วยตนเอง:</p>
                <code>${secret}</code>
                
                ${isNew ? `
                <div class="alert">
                    <strong>⚠️ ขั้นตอนสุดท้าย:</strong><br>
                    ให้นำรหัส Secret ด้านบนนี้ไปเพิ่มในไฟล์ <code>.env</code> ของคุณดังนี้:<br><br>
                    <code>ADMIN_TOTP_SECRET=${secret}</code><br><br>
                    จากนั้น <strong>Restart Server</strong> เพื่อเริ่มใช้งานจริง
                </div>
                ` : `
                <p style="margin-top: 20px;"><a href="/admin" style="color: #79080e; text-decoration: none; font-weight: 600;">&larr; กลับไปยังหน้า Admin</a></p>
                `}
            </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
