import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Webhook received:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const order = req.body;
    console.log('Order ID:', order?.id);

    if (!process.env.ATTIO_API_KEY) {
      throw new Error('ATTIO_API_KEY is not configured');
    }

    const response = await fetch('https://api.attio.com/v2/objects/orders/records', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ATTIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          values: {
            order_id: order.id?.toString() || '',
            customer_name: `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim(),
            email: order.email || '',
       
          }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Attio API error:', errorText);
      throw new Error(`Attio API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Success! Record created');
    
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}