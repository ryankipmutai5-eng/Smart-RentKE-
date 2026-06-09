import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendSTKPush } from '@/lib/payhero'
import { z } from 'zod'

const stkPushSchema = z.object({
  tenantId: z.string().min(1, 'tenantId is required'),
  amount: z.number().min(1, 'Minimum KES 1').max(150000, 'Maximum KES 150,000'),
})

const SERVICE_FEE = 20.0
const MAX_MONTHLY_RENT = 150000 // KES upper bound for Kenyan residential rent

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input shape and bounds
    const parsed = stkPushSchema.safeParse({
      tenantId: body.tenantId,
      amount: parseFloat(body.amount),
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { tenantId, amount } = parsed.data

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { landlord: true },
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    if (!tenant.is_active) {
      return NextResponse.json({ error: 'Tenant is inactive' }, { status: 400 })
    }

    const landlord = tenant.landlord
    if (!landlord.payhero_api_key || !landlord.payhero_merchant_id) {
      return NextResponse.json({ error: 'Payhero credentials not configured' }, { status: 400 })
    }

    // Sanity-check: amount must not exceed reasonable rent bounds
    if (amount > MAX_MONTHLY_RENT) {
      return NextResponse.json({ error: 'Amount exceeds maximum allowed rent' }, { status: 400 })
    }

    const totalAmount = amount + SERVICE_FEE
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!appUrl || appUrl.includes('your-domain')) {
      console.error('STK Push: NEXT_PUBLIC_APP_URL is not set to a valid production URL')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const payment = await prisma.payment.create({
      data: {
        tenant_id: tenant.id,
        landlord_id: landlord.id,
        amount,
        service_fee: SERVICE_FEE,
        status: 'pending',
        external_reference: tenant.house_number,
      },
    })

    try {
      const result = await sendSTKPush({
        amount: totalAmount,
        phone: tenant.phone,
        reference: payment.id,
        apiKey: landlord.payhero_api_key,
        merchantId: landlord.payhero_merchant_id,
        callbackUrl: `${appUrl}/api/webhooks/payhero`,
      })

      if (result.checkout_request_id) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { payhero_reference: result.checkout_request_id },
        })
      }

      return NextResponse.json({ success: true, paymentId: payment.id })
    } catch (payError: any) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      }).catch(() => {})

      return NextResponse.json(
        { error: payError.message || 'Failed to initiate M-PESA payment' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('STK Push error', { name: (error as Error).name })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}