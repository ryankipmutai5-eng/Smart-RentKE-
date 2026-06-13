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
    const { name, address } = await request.json();

    // Ensure property belongs to tenant
    const existing = await prisma.property.findFirst({
      where: { id, tenant_id: tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const property = await prisma.property.update({
      where: { id },
      data: { name, address },
    });

    return NextResponse.json(property);
  } catch (error: any) {
    console.error('Update Property Error:', error.message);
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

    // Ensure property belongs to tenant and check for active leases
    const existing = await prisma.property.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        units: {
          include: {
            leases: {
              where: { status: 'active' },
            },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const hasActiveLeases = existing.units.some((unit) => unit.leases.length > 0);
    if (hasActiveLeases) {
      return NextResponse.json(
        { error: 'Cannot delete property with active leases' },
        { status: 400 }
      );
    }

    // Soft delete
    await prisma.property.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return NextResponse.json({ message: 'Property deleted' });
  } catch (error: any) {
    console.error('Delete Property Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
