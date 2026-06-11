import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateReceiptPDF } from '@/lib/mpesa/receipt';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tenantId = request.headers.get('x-tenant-id');
  const paymentId = params.id;

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });
  }

  try {
    const payment = await prisma.rentPayment.findFirst({
      where: {
        id: paymentId,
        tenant_id: tenantId,
      },
      include: {
        lease: {
          include: {
            tenant_profile: true,
            unit: {
              include: {
                property: true,
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'successful') {
      return NextResponse.json({ error: 'Receipt only available for successful payments' }, { status: 400 });
    }

    const pdfBuffer = generateReceiptPDF(payment);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=receipt-${paymentId}.pdf`,
      },
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
