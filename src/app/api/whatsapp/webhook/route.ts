import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Evolution API event: messages.upsert
    if (body.event !== 'messages.upsert') {
        return NextResponse.json({ message: 'Ignored event' });
    }

    const data = body.data;
    if (!data || !data.message) {
        return NextResponse.json({ message: 'No message data' });
    }

    const remoteJid = data.key.remoteJid;
    const phone = remoteJid.split('@')[0];
    const content = data.message.conversation || data.message.extendedTextMessage?.text;

    if (!content) {
        return NextResponse.json({ message: 'No text content' });
    }

    // Find tenant profile by phone
    // We match the last 9 digits to be safe with 254 vs 07 vs +254
    const profile = await prisma.tenantProfile.findFirst({
        where: { phone: { contains: phone.slice(-9) } },
    });

    if (profile) {
        // Log conversation
        let conversation = await prisma.whatsappConversation.findFirst({
            where: { tenant_profile_id: profile.id },
        });

        if (!conversation) {
            conversation = await prisma.whatsappConversation.create({
                data: {
                    tenant_id: profile.tenant_id,
                    tenant_profile_id: profile.id,
                    contact_phone: phone,
                }
            });
        }

        // Save message
        await prisma.whatsappMessage.create({
            data: {
                conversation_id: conversation.id,
                tenant_id: profile.tenant_id,
                tenant_profile_id: profile.id,
                direction: 'inbound',
                content: content,
            }
        });
        
        // TODO: Basic AI response logic or ticket creation logic
    }

    return NextResponse.json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Error in WhatsApp webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
