import prisma from '../prisma';
import { sendWhatsAppMessage } from '../whatsapp/send';
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
        const message = `Hi ${lease.tenant_profile.name}, your lease for ${lease.unit_id} is expiring on ${format(endDate, 'do MMMM yyyy')}. Please contact management for renewal. [AI Assistant Disclosure: This is an automated message].`;
        
        await sendWhatsAppMessage(lease.tenant_profile.phone, message);
        
        await prisma.notification.create({
          data: {
            tenant_id: lease.tenant_id,
            type: 'whatsapp',
            recipient: lease.tenant_profile.phone,
            content: message,
            status: 'sent',
          },
        });
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
