import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const updateLeaseSchema = z.object({
  rent_amount: z.number().positive().optional(),
  status: z.enum(['active', 'terminated', 'expired']).optional(),
  ijarah_terms: z.record(z.any()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tenantId = request.headers.get('x-tenant-id');
  const leaseId = params.id;

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });
  }

  try {
    const lease = await prisma.lease.findFirst({
      where: {
        id: leaseId,
        tenant_id: tenantId,
      },
      include: {
        tenant_profile: true,
        unit: {
          include: {
            property: true,
          },
        },
        rent_payments: true,
      },
    });

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
    }

    return NextResponse.json(lease);
  } catch (error) {
    console.error('Error fetching lease:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const tenantId = request.headers.get('x-tenant-id');
  const leaseId = params.id;

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID missing' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validatedData = updateLeaseSchema.parse(body);

    const lease = await prisma.lease.findFirst({
      where: {
        id: leaseId,
        tenant_id: tenantId,
      },
    });

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
    }

    const updatedLease = await prisma.lease.update({
      where: { id: leaseId },
      data: validatedData,
    });

    return NextResponse.json(updatedLease);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error updating lease:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
