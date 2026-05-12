import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        tenant: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}
