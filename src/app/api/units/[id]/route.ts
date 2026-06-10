import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { unit_number, rent_amount, deposit_amount, status } = await request.json();

    // Ensure unit belongs to tenant
    const existing = await prisma.unit.findFirst({
      where: { id, tenant_id: tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    if (rent_amount !== undefined && Number(rent_amount) <= 0) {
      return NextResponse.json({ error: 'Rent amount must be greater than 0' }, { status: 400 });
    }

    if (deposit_amount !== undefined && Number(deposit_amount) < 0) {
      return NextResponse.json({ error: 'Deposit amount must be at least 0' }, { status: 400 });
    }

    const updated = await prisma.unit.update({
      where: { id },
      data: { 
        unit_number, 
        rent_amount: rent_amount ? Number(rent_amount) : undefined, 
        deposit_amount: deposit_amount ? Number(deposit_amount) : undefined,
        status 
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update Unit Error:', error.message);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unit number already exists in this property' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Ensure unit belongs to tenant
    const existing = await prisma.unit.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        leases: {
          where: { status: 'active' },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    // Validation: cannot delete unit with active leases
    if (existing.leases.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete unit with active leases' },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.unit.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: 'Unit deleted' });
  } catch (error: any) {
    console.error('Delete Unit Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
