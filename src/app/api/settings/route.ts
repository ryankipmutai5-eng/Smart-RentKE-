import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const landlord = await prisma.landlord.findFirst()
    return NextResponse.json(landlord)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const landlord = await prisma.landlord.findFirst()
    
    if (!landlord) {
      return NextResponse.json({ error: 'Landlord not found' }, { status: 404 })
    }

    const updated = await prisma.landlord.update({
      where: { id: landlord.id },
      data: {
        name: body.name,
        email: body.email,
        payhero_api_key: body.payhero_api_key,
        payhero_merchant_id: body.payhero_merchant_id,
        whatsapp_api_token: body.whatsapp_api_token,
        whatsapp_instance_id: body.whatsapp_instance_id
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
