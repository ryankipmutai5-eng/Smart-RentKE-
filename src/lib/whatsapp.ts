import axios from 'axios';

export async function sendWhatsAppMessage({
  phone,
  message,
  instanceId,
  token
}: {
  phone: string;
  message: string;
  instanceId: string;
  token: string;
}) {
  try {
    // Assuming Evolution API structure
    const response = await axios.post(
      `https://api.evolution-api.com/message/sendText/${instanceId}`,
      {
        number: phone,
        text: message
      },
      {
        headers: {
          'apikey': token,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('WhatsApp Error:', error.response?.data || error.message);
    // Don't throw, just log. Payment success is more important than the notification.
  }
}
