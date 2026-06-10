import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const propertyId = (await params).id;
    const { unit_number, rent_amount, deposit_amount } = await request.json();

    if (!unit_number || !rent_amount) {
      return NextResponse.json({ error: 'Unit number and rent amount are required' }, { status: 400 });
    }

    if (Number(rent_amount) <= 0) {
      return NextResponse.json({ error: 'Rent amount must be greater than 0' }, { status: 400 });
    }

    if (deposit_amount && Number(deposit_amount) < 0) {
      return NextResponse.json({ error: 'Deposit amount must be at least 0' }, { status: 400 });
    }

    // Ensure property belongs to tenant
    const property = await prisma.property.findFirst({
      where: { id: propertyId, tenant_id: tenantId },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const unit = await prisma.unit.create({
      data: {
        unit_number,
        rent_amount: Number(rent_amount),
        deposit_amount: deposit_amount ? Number(deposit_amount) : 0,
        property_id: propertyId,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(unit);
  } catch (error: any) {
    console.error('Create Unit Error:', error.message);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unit number already exists in this property' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const propertyId = (await params).id;

    const units = await prisma.unit.findMany({
      where: {
        property_id: propertyId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    return NextResponse.json(units);
  } catch (error: any) {
    console.error('List Units Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
