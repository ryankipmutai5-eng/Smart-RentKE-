import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const leaseSchema = z.object({
  tenant_profile_id: z.string().uuid(),
  unit_id: z.string().uuid(),
  start_date: z.string().transform((str) => new Date(str)),
  end_date: z.string().transform((str) => new Date(str)).optional(),
  rent_amount: z.number().positive(),
  deposit_amount: z.number().min(0),
  ijarah_terms: z.object({
    markup_percent: z.number().min(0),
    other_terms: z.string().optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });
  }

  try {
    const leases = await prisma.lease.findMany({
      where: {
        tenant_id: tenantId,
      },
      include: {
        tenant_profile: true,
        unit: {
          include: {
            property: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(leases);
  } catch (error) {
    console.error('Error fetching leases:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validatedData = leaseSchema.parse(body);

    // Check if unit belongs to tenant and is vacant
    const unit = await prisma.unit.findFirst({
      where: {
        id: validatedData.unit_id,
        property: {
          tenant_id: tenantId,
        },
      },
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found or access denied' }, { status: 404 });
    }

    if (unit.status !== 'vacant') {
      return NextResponse.json({ error: 'Unit is not vacant' }, { status: 400 });
    }

    // Check if tenant profile exists and belongs to tenant
    const tenantProfile = await prisma.tenantProfile.findFirst({
      where: {
        id: validatedData.tenant_profile_id,
        tenant_id: tenantId,
      },
    });

    if (!tenantProfile) {
      return NextResponse.json({ error: 'Tenant profile not found' }, { status: 404 });
    }

    // Markup calculation if provided
    let finalRentAmount = validatedData.rent_amount;
    if (validatedData.ijarah_terms?.markup_percent) {
        finalRentAmount = validatedData.rent_amount * (1 + validatedData.ijarah_terms.markup_percent / 100);
    }

    // Create lease and update unit status in a transaction
    const lease = await prisma.$transaction(async (tx) => {
      const newLease = await tx.lease.create({
        data: {
          tenant_profile_id: validatedData.tenant_profile_id,
          unit_id: validatedData.unit_id,
          tenant_id: tenantId,
          start_date: validatedData.start_date,
          end_date: validatedData.end_date,
          rent_amount: finalRentAmount,
          deposit_amount: validatedData.deposit_amount,
          ijarah_terms: validatedData.ijarah_terms || {},
          status: 'active',
        },
      });

      await tx.unit.update({
        where: { id: validatedData.unit_id },
        data: { status: 'occupied' },
      });

      return newLease;
    });

    return NextResponse.json(lease, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error creating lease:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
