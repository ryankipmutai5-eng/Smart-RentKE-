import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications/router';
import { z } from 'zod';

const sendNotificationSchema = z.object({
  tenant_profile_id: z.string().uuid(),
  type: z.enum(['payment_received', 'rent_reminder']),
  data: z.any(),
  lang: z.enum(['en', 'sw']).optional().default('en'),
});

export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { tenant_profile_id, type, data, lang } = sendNotificationSchema.parse(body);

    const success = await sendNotification(tenant_profile_id, type, data, lang);

    return NextResponse.json({ success });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
