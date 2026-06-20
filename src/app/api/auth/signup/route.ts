import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/auth/session';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password, tenantName, slug } = await request.json();

    if (!email || !password || !tenantName || !slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for this build
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Failed to create auth user' }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Create Tenant and User in Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug: slug,
        },
      });

      const user = await tx.user.create({
        data: {
          id: userId,
          email: email,
          tenant_id: tenant.id,
          role: 'admin', // First user is admin
        },
      });

      return { tenant, user };
    });

    // 3. Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ 
      user_id: result.user.id, 
      tenant_id: result.tenant.id, 
      role: result.user.role, 
      expires 
    });

    // 4. Set cookie
    (await cookies()).set('session', session, { expires, httpOnly: true });

    return NextResponse.json({ 
      message: 'Signup successful', 
      user: { id: result.user.id, email: result.user.email, role: result.user.role },
      tenant: { id: result.tenant.id, name: result.tenant.name }
    });

  } catch (error: any) {
    console.error('Signup Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
