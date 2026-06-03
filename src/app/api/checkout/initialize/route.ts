import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { buyer_id, email, event_id, ticket_type_id } = body;

    if (!buyer_id || !email || !event_id || !ticket_type_id) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // 1. SECURITY CHECK: Fetch the true price from the database
    const { data: ticketType, error: ticketError } = await supabase
      .from('ticket_types')
      .select('price, capacity, sold_count')
      .eq('id', ticket_type_id)
      .single();

    if (ticketError || !ticketType) {
      return NextResponse.json({ error: 'Ticket tier not found.' }, { status: 404 });
    }

    // 2. CAPACITY CHECK: Ensure it's not sold out
    if (ticketType.sold_count >= ticketType.capacity) {
      return NextResponse.json({ error: 'This ticket tier is sold out!' }, { status: 400 });
    }

    // 3. THE MATH: Ticket Price + ₦250 Baba K Flat Fee
    const platformFee = 250;
    const totalAmountNGN = Number(ticketType.price) + platformFee;
    const totalAmountKobo = totalAmountNGN * 100; // Paystack processes in Kobo

    // 4. GENERATE UNIQUE REFERENCE
    const transactionReference = `BABAK-${crypto.randomUUID()}`;

    // 5. SAVE PENDING TRANSACTION TO DATABASE
    const { error: txError } = await supabase
      .from('transactions')
      .insert([{
        buyer_id,
        event_id,
        amount: totalAmountNGN,
        platform_fee: platformFee,
        payment_gateway: 'paystack',
        gateway_reference: transactionReference,
        status: 'pending'
      }]);

    if (txError) {
      console.error('Transaction DB Error:', txError);
      return NextResponse.json({ error: 'Failed to initialize transaction.' }, { status: 500 });
    }

    // 6. CALL PAYSTACK API
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        amount: totalAmountKobo,
        reference: transactionReference,
        // Optional: Redirect them to their wallet after successful payment
        callback_url: 'http://localhost:3000/wallet' 
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json({ error: 'Payment gateway error.' }, { status: 502 });
    }

    // 7. RETURN SECURE CHECKOUT URL TO FRONTEND
    return NextResponse.json(
      { 
        message: 'Checkout initialized', 
        authorization_url: paystackData.data.authorization_url,
        reference: transactionReference
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}