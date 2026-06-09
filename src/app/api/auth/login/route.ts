import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/auth/session';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // 1. Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const userId = authData.user.id;

    // 2. Fetch user and tenant info from Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    // 3. Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await encrypt({ 
      user_id: user.id, 
      tenant_id: user.tenant_id, 
      role: user.role, 
      expires 
    });

    // 4. Set cookie
    (await cookies()).set('session', session, { expires, httpOnly: true });

    return NextResponse.json({ 
      message: 'Login successful', 
      user: { id: user.id, email: user.email, role: user.role },
      tenant: { id: user.tenant.id, name: user.tenant.name }
    });

  } catch (error: any) {
    console.error('Login Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
