import axios from 'axios'

export async function sendWhatsAppMessage({
  phone,
  message,
  instanceId,
  token
}: {
  phone: string
  message: string
  instanceId: string
  token: string
}) {
  try {
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
    )
    return response.data
  } catch (error: any) {
    // Sanitized logging — never log raw error response bodies which may contain tokens
    console.error('WhatsApp notification failed', {
      status: error.response?.status,
      endpoint: 'sendText',
    })
    // Don't throw — payment success is more important than the notification
  }
}