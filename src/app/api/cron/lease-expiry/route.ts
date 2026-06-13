import { NextRequest, NextResponse } from 'next/server';
import { processLeaseExpiryReminders } from '@/lib/scheduler/lease-expiry';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await processLeaseExpiryReminders();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cron Error (Lease Expiry):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
