import axios from 'axios';

export async function sendWhatsAppMessage(phone: string, message: string) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiToken = process.env.WHATSAPP_API_TOKEN;
  const instanceId = process.env.WHATSAPP_INSTANCE_ID;

  if (!apiUrl || !apiToken || !instanceId) {
    console.error('WhatsApp API config missing');
    return false;
  }

  // Format phone to 254XXXXXXXXX
  let formattedPhone = phone.replace(/[^0-9]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.slice(1);
  }

  try {
    // This assumes Evolution API structure as mentioned in the prompt
    const response = await axios.post(`${apiUrl}/message/sendText/${instanceId}`, {
      number: formattedPhone,
      text: message,
    }, {
      headers: {
        'apikey': apiToken,
      },
    });

    return response.status === 201 || response.status === 200;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}
