import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { initiateStkPush } from '@/lib/mpesa/stk-push';
import { z } from 'zod';

const collectSchema = z.object({
  lease_id: z.string().uuid(),
  phone: z.string().regex(/^(?:254|0)[17]\d{8}$/),
});

export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { lease_id, phone } = collectSchema.parse(body);

    const lease = await prisma.lease.findFirst({
      where: {
        id: lease_id,
        tenant_id: tenantId,
      },
      include: {
        unit: true,
      },
    });

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
    }

    const rentAmount = Number(lease.rent_amount);
    
    // Service Fee: 20 KES or 1%
    const serviceFee = Math.max(20, rentAmount * 0.01);
    
    // Penalty logic (Sadaqah)
    let penaltyAmount = 0;
    const today = new Date();
    const currentDay = today.getDate();
    if (currentDay > lease.due_day) {
        // Late payment penalty - 500 KES (Sadaqah)
        penaltyAmount = 500;
    }

    const totalAmount = rentAmount + serviceFee + penaltyAmount;
    const externalReference = `PAY-${Date.now()}`;

    // Create a pending payment record
    const payment = await prisma.rentPayment.create({
      data: {
        lease_id,
        tenant_id: tenantId,
        amount: totalAmount,
        service_fee: serviceFee,
        sadaqah_penalty: penaltyAmount,
        status: 'pending',
        external_reference: externalReference,
      },
    });

    // Trigger STK Push
    const stkResponse = await initiateStkPush(phone, totalAmount, externalReference);

    // Update payment with MerchantRequestID and CheckoutRequestID
    await prisma.rentPayment.update({
      where: { id: payment.id },
      data: {
        payhero_reference: stkResponse.CheckoutRequestID,
      },
    });

    return NextResponse.json({
      message: 'STK Push initiated',
      checkout_request_id: stkResponse.CheckoutRequestID,
      payment_id: payment.id,
      total_amount: totalAmount,
      rent_amount: rentAmount,
      service_fee: serviceFee,
      penalty: penaltyAmount,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error collecting payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
