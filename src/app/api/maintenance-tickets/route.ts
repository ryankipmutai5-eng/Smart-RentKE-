import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { unit_id, description, priority } = await request.json();

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    // Generate ticket number: MNT-YYYYMM-XXXX
    const now = new Date();
    const yearMonth = now.toISOString().slice(0, 7).replace('-', '');
    const count = await prisma.maintenanceTicket.count({
      where: {
        tenant_id: tenantId,
        created_at: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
        },
      },
    });
    const ticketNumber = `MNT-${yearMonth}-${(count + 1).toString().padStart(4, '0')}`;

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        ticket_number: ticketNumber,
        description,
        priority: priority || 'medium',
        unit_id,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error('Create Maintenance Ticket Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tickets = await prisma.maintenanceTicket.findMany({
      where: { tenant_id: tenantId },
      include: {
        unit: {
          select: { 
            unit_number: true, 
            property: { 
              select: { name: true } 
            } 
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('List Maintenance Tickets Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
