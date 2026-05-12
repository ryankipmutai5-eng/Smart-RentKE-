import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        payments: {
          orderBy: {
            created_at: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    return NextResponse.json(tenants)
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, house_number, rent_amount, due_date } = body

    // Validate input
    if (!name || !phone || !house_number || !rent_amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the first landlord (simplified for this SaaS)
    const landlord = await prisma.landlord.findFirst()
    if (!landlord) {
      return NextResponse.json({ error: 'No landlord found' }, { status: 500 })
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        phone,
        house_number,
        rent_amount: parseFloat(rent_amount),
        due_date: parseInt(due_date) || 1,
        landlord_id: landlord.id
      }
    })

    return NextResponse.json(tenant)
  } catch (error) {
    console.error('Error creating tenant:', error)
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
  }
}
