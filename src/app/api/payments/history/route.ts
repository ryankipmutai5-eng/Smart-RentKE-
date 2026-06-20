import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });
  }

  try {
    const payments = await prisma.rentPayment.findMany({
      where: {
        tenant_id: tenantId,
      },
      include: {
        lease: {
          include: {
            unit: true,
          }
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
