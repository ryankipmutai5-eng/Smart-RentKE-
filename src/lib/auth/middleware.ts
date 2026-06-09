import { NextRequest, NextResponse } from 'next/server';
import { getSession } from './session';

export async function validateTenant(request: NextRequest) {
  const session = await getSession();
  
  if (!session || !session.tenant_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // We can attach the tenant_id to the headers to pass it to the route handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', session.tenant_id);
  requestHeaders.set('x-user-id', session.user_id);
  requestHeaders.set('x-user-role', session.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export function requireRole(role: 'admin' | 'staff' | 'viewer', userRole: string) {
  const roles = ['viewer', 'staff', 'admin'];
  const userRoleIndex = roles.indexOf(userRole);
  const requiredRoleIndex = roles.indexOf(role);

  return userRoleIndex >= requiredRoleIndex;
}
