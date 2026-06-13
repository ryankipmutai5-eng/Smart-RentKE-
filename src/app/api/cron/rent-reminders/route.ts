import { NextRequest, NextResponse } from 'next/server';
import { processRentReminders } from '@/lib/scheduler/rent-reminders';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await processRentReminders();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cron Error (Rent Reminders):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
