import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createTenantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^254[0-9]{9}$/, 'Phone must be in format 2547XXXXXXXX'),
  house_number: z.string().min(1, 'House number is required').max(20),
  rent_amount: z.number().min(1, 'Minimum KES 1').max(150000, 'Maximum KES 150,000'),
  due_date: z.number().int().min(1).max(28).optional().default(1),
})

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        payments: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
    })
    return NextResponse.json(tenants)
  } catch (error) {
    console.error('Error fetching tenants:', { name: (error as Error).name })
    return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const parsed = createTenantSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, phone, house_number, rent_amount, due_date } = parsed.data

    // Check for duplicate tenant (same house number for same landlord)
    const existing = await prisma.tenant.findFirst({
      where: { house_number, is_active: true },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'A tenant already occupies this house' },
        { status: 409 }
      )
    }

    // For MVP, associate with first landlord; full auth will scope this per-landlord
    const landlord = await prisma.landlord.findFirst()
    if (!landlord) {
      return NextResponse.json({ error: 'No landlord account found' }, { status: 500 })
    }

    const tenant = await prisma.tenant.create({
      data: {
        name,
        phone,
        house_number,
        rent_amount,
        due_date,
        landlord_id: landlord.id,
      },
    })

    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error('Error creating tenant:', { name: (error as Error).name })
    return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 })
  }
}