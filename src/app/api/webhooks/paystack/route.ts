import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    // 1. Get the raw text body and Paystack's security signature
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // 2. CRITICAL SECURITY: Verify this actually came from Paystack, not a hacker
    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    const expectedSignature = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('🚨 ALERT: Invalid Webhook Signature Detected!');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse the verified data
    const event = JSON.parse(rawBody);

    // 4. We only care if the payment was a massive success
    if (event.event === 'charge.success') {
      const reference = event.data.reference; // e.g., BABAK-1234abcd

      // Find the pending transaction in our database
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('gateway_reference', reference)
        .single();

      if (transaction && transaction.status === 'pending') {
        
        // A. Mark the transaction as SUCCESS
        await supabase
          .from('transactions')
          .update({ status: 'success' })
          .eq('id', transaction.id);

        // B. MINT THE DIGITAL TICKET
        const uniqueQrCode = `BABA-K-QR-${crypto.randomUUID()}`;
        const serialNumber = `TKT-${Math.floor(Math.random() * 100000000)}`;

        await supabase
          .from('purchased_tickets')
          .insert([{
            transaction_id: transaction.id,
            buyer_id: transaction.buyer_id,
            qr_code_hash: uniqueQrCode,
            serial_number: serialNumber,
            is_validated: false
          }]);
          
        console.log(`✅ Ticket ${serialNumber} successfully minted for transaction ${reference}`);
      }
    }

    // 5. Always tell Paystack "200 OK" so they stop sending the webhook
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}