import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // 1. Total Tenants
    const totalTenants = await prisma.tenantProfile.count({
      where: { tenant_id: tenantId },
    });

    // 2. Payments stats for this month
    const payments = await prisma.rentPayment.findMany({
      where: {
        tenant_id: tenantId,
        created_at: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    const totalCollected = payments
      .filter((p) => p.status === 'successful')
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const pendingAmount = payments
      .filter((p) => p.status === 'pending')
      .reduce((acc, p) => acc + Number(p.amount), 0);

    const overdueAmount = payments
      .filter((p) => p.status === 'failed')
      .reduce((acc, p) => acc + Number(p.amount), 0);

    // 3. Recent payments (last 5)
    const recentPayments = await prisma.rentPayment.findMany({
      where: { tenant_id: tenantId },
      include: {
        lease: {
          include: {
            tenant_profile: true,
            unit: true,
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      stats: {
        totalCollected,
        pendingAmount,
        overdueAmount,
        totalTenants,
      },
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        tenant_name: p.lease.tenant_profile.name,
        house_number: p.lease.unit.unit_number,
        amount: Number(p.amount),
        status: p.status,
        created_at: p.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Dashboard Stats Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
