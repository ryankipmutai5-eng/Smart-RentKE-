import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendSTKPush } from '@/lib/payhero'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tenantId, amount } = body

    if (!tenantId || !amount) {
      return NextResponse.json({ error: 'Missing tenantId or amount' }, { status: 400 })
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { landlord: true }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    const landlord = tenant.landlord
    if (!landlord.payhero_api_key || !landlord.payhero_merchant_id) {
      return NextResponse.json({ error: 'Payhero credentials not configured' }, { status: 400 })
    }

    // Add service fee
    const serviceFee = 20.0
    const totalAmount = parseFloat(amount) + serviceFee

    // Create a pending payment record
    const payment = await prisma.payment.create({
      data: {
        tenant_id: tenant.id,
        landlord_id: landlord.id,
        amount: parseFloat(amount),
        service_fee: serviceFee,
        status: 'pending',
        external_reference: tenant.house_number
      }
    })

    // Initiate STK Push
    // In a real scenario, callbackUrl would be your public endpoint
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/api/webhooks/payhero`
    
    try {
      const result = await sendSTKPush({
        amount: totalAmount,
        phone: tenant.phone,
        reference: payment.id, // Use payment ID for reconciliation
        apiKey: landlord.payhero_api_key,
        merchantId: landlord.payhero_merchant_id,
        callbackUrl
      })

      // Update payment with payhero reference if returned
      if (result.checkout_request_id) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { payhero_reference: result.checkout_request_id }
        })
      }

      return NextResponse.json({ success: true, paymentId: payment.id, result })
    } catch (payError: any) {
      // If STK push fails, mark payment as failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' }
      })
      return NextResponse.json({ error: payError.message }, { status: 500 })
    }

  } catch (error) {
    console.error('STK Push Route Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
