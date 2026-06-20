import prisma from '../prisma';
import { sendNotification } from '../notifications/router';
import { addDays, isSameDay, format } from 'date-fns';

export async function processLeaseExpiryReminders() {
  const today = new Date();
  
  // Find active leases with end_date
  const leases = await prisma.lease.findMany({
    where: { 
        status: 'active',
        end_date: { not: null }
    },
    include: {
      tenant_profile: true,
    },
  });

  for (const lease of leases) {
    if (!lease.end_date) continue;

    const endDate = new Date(lease.end_date);
    
    // Check if reminder is needed: 30, 14, 7 days before
    const reminderDays = [-30, -14, -7];
    
    for (const offset of reminderDays) {
      const reminderDate = addDays(endDate, offset);
      
      if (isSameDay(today, reminderDate)) {
        await sendNotification(
          lease.tenant_profile_id,
          'lease_expiry',
          {
            ref: format(endDate, 'do MMMM yyyy')
          }
        ).catch(err => console.error('Failed to send lease expiry reminder:', err));
      }
    }

    // Auto-expire leases
    if (today > endDate) {
        await prisma.lease.update({
            where: { id: lease.id },
            data: { status: 'expired' }
        });

        await prisma.unit.update({
            where: { id: lease.unit_id },
            data: { status: 'vacant' }
        });
    }
  }
}
