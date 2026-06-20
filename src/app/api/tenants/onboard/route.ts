import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const onboardingSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^(254|0)[0-9]{9}$/),
  email: z.string().email().optional().or(z.literal('')),
  property_id: z.string().uuid(),
  unit_id: z.string().uuid(),
  start_date: z.string().transform((str) => new Date(str)),
  rent_amount: z.number().positive(),
  deposit_amount: z.number().min(0),
  due_day: z.number().int().min(1).max(28).default(1),
});

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = onboardingSchema.parse(body);

    // 1. Verify property and unit belong to tenant and unit is vacant
    const unit = await prisma.unit.findFirst({
      where: {
        id: validatedData.unit_id,
        property_id: validatedData.property_id,
        tenant_id: tenantId,
      },
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found or access denied' }, { status: 404 });
    }

    if (unit.status !== 'vacant') {
      return NextResponse.json({ error: 'Unit is already occupied' }, { status: 400 });
    }

    // 2. Run onboarding in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // a. Create Tenant Profile (Renter)
      const profile = await tx.tenantProfile.create({
        data: {
          name: validatedData.name,
          phone: validatedData.phone,
          email: validatedData.email || null,
          tenant_id: tenantId,
        },
      });

      // b. Create Lease
      const lease = await tx.lease.create({
        data: {
          tenant_profile_id: profile.id,
          unit_id: validatedData.unit_id,
          tenant_id: tenantId,
          start_date: validatedData.start_date,
          rent_amount: validatedData.rent_amount,
          deposit_amount: validatedData.deposit_amount,
          due_day: validatedData.due_day,
          status: 'active',
        },
      });

      // c. Update Unit status
      await tx.unit.update({
        where: { id: validatedData.unit_id },
        data: { status: 'occupied' },
      });

      return { profile, lease };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error('Tenant Onboarding Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
