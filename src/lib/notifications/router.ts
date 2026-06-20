import { sendWhatsAppMessage } from '../whatsapp/send';
import { sendSMS } from '../sms/send';
import prisma from '../prisma';

export async function sendNotification(
  tenantProfileId: string,
  type: 'payment_received' | 'rent_reminder',
  data: any,
  lang: 'en' | 'sw' = 'en'
) {
  const profile = await prisma.tenantProfile.findUnique({
    where: { id: tenantProfileId },
  });

  if (!profile) return false;

  const tenant = await prisma.tenant.findUnique({
    where: { id: profile.tenant_id },
  });

  if (!tenant) return false;

  const { templates } = require('./templates');
  const template = templates[type][lang];
  const message = typeof template === 'function' ? template(profile.name, data.amount, data.ref || data.dueDate) : '';

  // Try WhatsApp first if credentials exist
  let waSuccess = false;
  if (tenant.whatsapp_api_token && tenant.whatsapp_instance_id) {
    waSuccess = await sendWhatsAppMessage({
      phone: profile.phone,
      message,
      apiToken: tenant.whatsapp_api_token,
      instanceId: tenant.whatsapp_instance_id,
    });
  }
  
  if (waSuccess) {
    await prisma.notification.create({
      data: {
        tenant_id: profile.tenant_id,
        type: 'whatsapp',
        recipient: profile.phone,
        content: message,
        status: 'sent',
      },
    });
    return true;
  }

  // Fallback to SMS
  const smsSuccess = await sendSMS(profile.phone, message);
  
  await prisma.notification.create({
    data: {
      tenant_id: profile.tenant_id,
      type: 'sms',
      recipient: profile.phone,
      content: message,
      status: smsSuccess ? 'sent' : 'failed',
    },
  });

  return smsSuccess;
}
