import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const tenantProfileSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^(254|0)[0-9]{9}$/, 'Invalid phone number format'),
  email: z.string().email().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = tenantProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, phone, email } = parsed.data;

    const tenantProfile = await prisma.tenantProfile.create({
      data: {
        name,
        phone,
        email: email || null,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(tenantProfile, { status: 201 });
  } catch (error: any) {
    console.error('Create Tenant Profile Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tenantProfiles = await prisma.tenantProfile.findMany({
      where: { tenant_id: tenantId },
      include: {
        leases: {
          where: { status: 'active' },
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(tenantProfiles);
  } catch (error: any) {
    console.error('List Tenant Profiles Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
