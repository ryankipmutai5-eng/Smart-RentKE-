import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('M-Pesa Callback:', JSON.stringify(body));

    const stkCallback = body.Body.stkCallback;
    const checkoutRequestID = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;

    const payment = await prisma.rentPayment.findFirst({
      where: { payhero_reference: checkoutRequestID },
    });

    if (!payment) {
      console.error('Payment not found for checkoutRequestID:', checkoutRequestID);
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    // Idempotency: Check if already processed
    if (payment.status !== 'pending') {
        return NextResponse.json({ message: 'Payment already processed' });
    }

    if (resultCode === 0) {
      // Success
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const mpesaReceiptNumber = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      
      await prisma.rentPayment.update({
        where: { id: payment.id },
        data: {
          status: 'successful',
          paid_at: new Date(),
          payhero_reference: mpesaReceiptNumber, // Overwrite with actual receipt number
        },
      });

      // TODO: Trigger WhatsApp notification (Phase 6)
      // TODO: Generate PDF receipt (Phase 5)
      
    } else {
      // Failed
      await prisma.rentPayment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
        },
      });
    }

    return NextResponse.json({ message: 'Callback processed' });
  } catch (error) {
    console.error('Error in M-Pesa callback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
