import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, address } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Property name is required' }, { status: 400 });
    }

    const property = await prisma.property.create({
      data: {
        name,
        address,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(property);
  } catch (error: any) {
    console.error('Create Property Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const properties = await prisma.property.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        _count: {
          select: { 
            units: {
              where: { deleted_at: null }
            }
          },
        },
      },
    });

    return NextResponse.json(properties);
  } catch (error: any) {
    console.error('List Properties Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
