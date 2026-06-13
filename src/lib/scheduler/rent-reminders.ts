import prisma from '../prisma';
import { sendNotification } from '../notifications/router';
import { addDays, isSameDay, format } from 'date-fns';

export async function processRentReminders() {
  const today = new Date();
  
  // Find active leases
  const leases = await prisma.lease.findMany({
    where: { status: 'active' },
    include: {
      tenant_profile: true,
    },
  });

  for (const lease of leases) {
    const dueDay = lease.due_day;
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const dueDate = new Date(currentYear, currentMonth, dueDay);
    
    // Check if reminder is needed: 5 days before, 1 day before, on due date, 3 days after
    const reminderDays = [-5, -1, 0, 3];
    
    for (const offset of reminderDays) {
      const reminderDate = addDays(dueDate, offset);
      
      if (isSameDay(today, reminderDate)) {
        // Check idempotency: Have we already sent a reminder for this lease/month/offset?
        const existingNotification = await prisma.notification.findFirst({
            where: {
                tenant_id: lease.tenant_id,
                recipient: lease.tenant_profile.phone,
                type: 'whatsapp',
                created_at: {
                    gte: new Date(today.setHours(0,0,0,0)),
                    lte: new Date(today.setHours(23,59,59,999)),
                },
                content: { contains: 'reminder' }
            }
        });

        if (!existingNotification) {
          // Send reminder
          await sendNotification(
            lease.tenant_profile_id,
            'rent_reminder',
            {
              amount: Number(lease.rent_amount),
              dueDate: format(dueDate, 'do MMMM yyyy'),
            }
          );
        }
      }
    }
  }
}
