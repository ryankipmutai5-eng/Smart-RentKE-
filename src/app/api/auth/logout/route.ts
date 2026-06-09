import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // 1. Sign out from Supabase Auth
    await supabase.auth.signOut();

    // 2. Clear session cookie
    (await cookies()).delete('session');

    return NextResponse.json({ message: 'Logged out successful' });
  } catch (error: any) {
    console.error('Logout Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
