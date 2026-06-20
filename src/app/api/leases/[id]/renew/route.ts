import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const renewSchema = z.object({
  new_end_date: z.string().transform((str) => new Date(str)),
  new_rent_amount: z.number().positive().optional(),
  ijarah_terms: z.object({
    markup_percent: z.number().min(0),
    other_terms: z.string().optional(),
  }).optional(),
});

export async function POST(
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
    const validatedData = renewSchema.parse(body);

    const lease = await prisma.lease.findFirst({
      where: {
        id: leaseId,
        tenant_id: tenantId,
      },
    });

    if (!lease) {
      return NextResponse.json({ error: 'Lease not found' }, { status: 404 });
    }

    // In Ijarah, renewal might involve a new markup
    let finalRentAmount = validatedData.new_rent_amount || Number(lease.rent_amount);
    if (validatedData.ijarah_terms?.markup_percent) {
        // If they provided a new markup base rent
        const baseRent = validatedData.new_rent_amount || Number(lease.rent_amount);
        finalRentAmount = baseRent * (1 + validatedData.ijarah_terms.markup_percent / 100);
    }

    const updatedLease = await prisma.lease.update({
      where: { id: leaseId },
      data: {
        end_date: validatedData.new_end_date,
        rent_amount: finalRentAmount,
        ijarah_terms: {
          ...(lease.ijarah_terms as any),
          renewal: {
            renewed_at: new Date(),
            previous_end_date: lease.end_date,
            previous_rent_amount: lease.rent_amount,
            new_ijarah_terms: validatedData.ijarah_terms,
          }
        },
        status: 'active', // Ensure it's active if it was expired
      },
    });

    return NextResponse.json(updatedLease);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Error renewing lease:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
