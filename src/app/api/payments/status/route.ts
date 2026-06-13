import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  const checkoutRequestID = request.nextUrl.searchParams.get('checkoutRequestID');

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });
  }

  if (!checkoutRequestID) {
    return NextResponse.json({ error: 'CheckoutRequestID missing' }, { status: 400 });
  }

  try {
    const payment = await prisma.rentPayment.findFirst({
      where: {
        payhero_reference: checkoutRequestID,
        tenant_id: tenantId,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
