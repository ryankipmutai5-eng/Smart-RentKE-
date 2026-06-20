import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    return NextResponse.json(tenant);
  } catch (error: any) {
    console.error('Fetch Settings Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: body.name,
        payhero_api_key: body.payhero_api_key,
        payhero_merchant_id: body.payhero_merchant_id,
        whatsapp_api_token: body.whatsapp_api_token,
        whatsapp_instance_id: body.whatsapp_instance_id,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Save Settings Error:', error.message);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
