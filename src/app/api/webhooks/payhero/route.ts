import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Payhero Webhook Received:', body)

    // Payhero webhook structure usually includes ResponseCode and ExternalReference (which we set to payment.id)
    const { ResultCode, ResultDesc, ExternalReference, CheckoutRequestID } = body

    if (ResultCode === 0) {
      // Payment Successful
      const payment = await prisma.payment.update({
        where: { id: ExternalReference },
        data: {
          status: 'successful',
          paid_at: new Date(),
          payhero_reference: CheckoutRequestID
        },
        include: {
          tenant: true,
          landlord: true
        }
      })

      // Send WhatsApp notification
      if (payment.landlord.whatsapp_api_token && payment.landlord.whatsapp_instance_id) {
        const message = `Hello ${payment.tenant.name}, we have received your rent payment of KES ${payment.amount} for House ${payment.tenant.house_number}. Thank you!`
        await sendWhatsAppMessage({
          phone: payment.tenant.phone,
          message,
          instanceId: payment.landlord.whatsapp_instance_id,
          token: payment.landlord.whatsapp_api_token
        })
      }

      return NextResponse.json({ success: true })
    } else {
      // Payment Failed
      await prisma.payment.update({
        where: { id: ExternalReference },
        data: {
          status: 'failed'
        }
      })
      return NextResponse.json({ success: false, message: ResultDesc })
    }

  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
