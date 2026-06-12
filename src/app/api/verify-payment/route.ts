import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const { reference, email, eventId, tierName, price, quantity = 1, buyerName, isFree } = await request.json();

    if (!reference || !email || !eventId || !tierName) {
      return NextResponse.json({ success: false, message: 'Missing payment verification payload.' }, { status: 400 });
    }

    // Verify payment with Paystack (unless it's a free ticket)
    let paymentData: any = null;
    if (!isFree && price > 0) {
      const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
      });
      paymentData = await verifyResponse.json();

      if (!paymentData.status || paymentData.data.status !== 'success') {
        return NextResponse.json({ success: false, message: 'Payment verification failed.' }, { status: 400 });
      }
    }

    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('id,email,full_name')
      .eq('email', email)
      .single();

    if (userError || !userRecord) {
      console.error('Buyer lookup failed:', userError);
      return NextResponse.json({ success: false, message: 'Buyer record not found.' }, { status: 404 });
    }

    const { data: ticketTypeRecord, error: ticketTypeError } = await supabase
      .from('ticket_types')
      .select('id')
      .eq('name', tierName)
      .eq('event_id', eventId)
      .single();

    if (ticketTypeError || !ticketTypeRecord) {
      console.error('Ticket tier lookup failed:', ticketTypeError);
      return NextResponse.json({ success: false, message: 'Ticket tier not found for this event.' }, { status: 404 });
    }

    const { data: transactionRecord, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        buyer_id: userRecord.id,
        event_id: eventId,
        amount: price * quantity,
        platform_fee: 0,
        payment_gateway: 'paystack',
      })
      .select('id')
      .single();

    if (transactionError || !transactionRecord?.id) {
      console.error('Transaction insert failed:', transactionError);
      return NextResponse.json({ success: false, message: 'Unable to record transaction.' }, { status: 500 });
    }

    const ticketRows = Array.from({ length: quantity }, (_, i) => ({
      buyer_email: email,
      buyer_name: buyerName || (paymentData?.data?.customer?.first_name ?? 'Guest'),
      event_id: eventId,
      ticket_type_id: ticketTypeRecord.id,
      price_paid: price || 0,
      fee_paid: 0,
      serial_number: `NBK-${reference}-${i + 1}`,
      qr_code_hash: `BABAK-${reference}-${i + 1}`,
      payment_gateway: isFree ? 'free' : 'paystack',
      transaction_id: transactionRecord.id,
    }));

    const { data: tickets, error: ticketsError } = await supabase
      .from('purchased_tickets')
      .insert(ticketRows)
      .select('*');

    if (ticketsError) {
      console.error('Ticket insert failed:', ticketsError);
      return NextResponse.json({ success: false, message: 'Unable to create purchased tickets.' }, { status: 500 });
    }

    const mappedTickets = (tickets || []).map((ticket: any) => ({
      id: ticket.id,
      qrCode: ticket.qr_code_hash || '',
      serialNumber: ticket.serial_number || '',
      purchaseDate: ticket.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      pricePaid: Number(ticket.price_paid ?? 0),
      feePaid: Number(ticket.fee_paid ?? 0),
      buyerEmail: ticket.buyer_email || '',
      buyerName: ticket.buyer_name || '',
      eventId: ticket.event_id || '',
      paymentGateway: ticket.payment_gateway || 'paystack',
      isReselling: Boolean(ticket.is_reselling ?? false),
      resalePrice: ticket.resale_price ?? undefined,
      isValidated: Boolean(ticket.is_validated ?? false),
      validatedAt: ticket.validated_at ?? undefined,
    }));

    return NextResponse.json({ 
      success: true, 
      message: `${quantity} ticket(s) created successfully`,
      tickets: mappedTickets 
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}