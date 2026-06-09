import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import crypto from 'crypto'

// Payhero webhook signature verification
function verifyPayheroSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('X-Payhero-Signature')
    const webhookSecret = process.env.PAYHERO_WEBHOOK_SECRET

    // Verify webhook authenticity — reject unsigned requests
    if (webhookSecret && !verifyPayheroSignature(rawBody, signature, webhookSecret)) {
      console.error('Webhook signature verification failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = JSON.parse(rawBody)
    console.log('Payhero Webhook Received:', { ResultCode: body.ResultCode, ExternalReference: body.ExternalReference })

    const { ResultCode, ResultDesc, ExternalReference, CheckoutRequestID } = body

    if (ResultCode === 0) {
      // Fetch payment with landlord data BEFORE updating — fail if payment not found
      const payment = await prisma.payment.findUnique({
        where: { id: ExternalReference },
        include: { tenant: true, landlord: true },
      })

      if (!payment) {
        console.error('Webhook: Payment not found', ExternalReference)
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      // Idempotency — if already successful, return 200 without re-processing
      if (payment.status === 'successful') {
        return NextResponse.json({ success: true, idempotent: true })
      }

      await prisma.payment.update({
        where: { id: ExternalReference },
        data: {
          status: 'successful',
          paid_at: new Date(),
          payhero_reference: CheckoutRequestID,
        },
      })

      // Send WhatsApp notification (non-blocking, don't fail webhook response)
      if (payment.landlord.whatsapp_api_token && payment.landlord.whatsapp_instance_id) {
        const message = `Hello ${payment.tenant.name}, we have received your rent payment of KES ${payment.amount} for House ${payment.tenant.house_number}. Thank you!`
        sendWhatsAppMessage({
          phone: payment.tenant.phone,
          message,
          instanceId: payment.landlord.whatsapp_instance_id,
          token: payment.landlord.whatsapp_api_token,
        }).catch(() => {}) // Fire-and-forget, don't let WhatsApp failure affect webhook
      }

      return NextResponse.json({ success: true })
    } else {
      // Payment failed — update status
      await prisma.payment.update({
        where: { id: ExternalReference },
        data: { status: 'failed' },
      }).catch(() => {}) // Ignore if payment not found

      return NextResponse.json({ success: false, message: ResultDesc })
    }

  } catch (error) {
    // Log sanitized error only — never expose raw stack or response data
    console.error('Webhook processing error', { name: (error as Error).name })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}