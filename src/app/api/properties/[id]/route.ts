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

    const updated = await prisma.property.update({
      where: { id },
      data: { name, address },
    });

    return NextResponse.json(updated);
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

    // Ensure property belongs to tenant
    const existing = await prisma.property.findFirst({
      where: { id, tenant_id: tenantId },
      include: {
        units: {
          where: {
            leases: {
              some: { status: 'active' },
            },
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Validation: cannot delete property with active leases
    if (existing.units.length > 0) {
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
