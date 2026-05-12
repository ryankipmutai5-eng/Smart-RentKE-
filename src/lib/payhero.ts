import axios from 'axios';

const PAYHERO_API_URL = 'https://backend.payhero.co.ke/api/v2';

export async function sendSTKPush({
  amount,
  phone,
  reference,
  apiKey,
  merchantId,
  callbackUrl
}: {
  amount: number;
  phone: string;
  reference: string;
  apiKey: string;
  merchantId: string;
  callbackUrl: string;
}) {
  try {
    const response = await axios.post(
      `${PAYHERO_API_URL}/payments/stk-push`,
      {
        amount,
        phone_number: phone,
        channel_id: merchantId,
        external_reference: reference,
        callback_url: callbackUrl,
      },
      {
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Payhero STK Push Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initiate payment');
  }
}
