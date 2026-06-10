import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const ticket = await prisma.maintenanceTicket.findFirst({
      where: { id, tenant_id: tenantId },
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
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error('Get Maintenance Ticket Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { status, priority, description } = await request.json();

    const existing = await prisma.maintenanceTicket.findFirst({
      where: { id, tenant_id: tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const updated = await prisma.maintenanceTicket.update({
      where: { id },
      data: { status, priority, description },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update Maintenance Ticket Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
