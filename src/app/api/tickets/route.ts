import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Missing buyer email query parameter.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('purchased_tickets')
      .select('*')
      .ilike('buyer_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load tickets:', error);
      return NextResponse.json(
        { success: false, error: 'Unable to load tickets. Please try again later.' },
        { status: 500 }
      );
    }

    const tickets = (data || []).map((ticket: any) => ({
      id: ticket.id,
      qrCode: ticket.qr_code_hash || ticket.qrCode || '',
      serialNumber: ticket.serial_number || ticket.serialNumber || '',
      purchaseDate: ticket.created_at?.split('T')[0] || ticket.purchase_date || new Date().toISOString().split('T')[0],
      pricePaid: Number(ticket.price_paid ?? ticket.pricePaid ?? 0),
      feePaid: Number(ticket.fee_paid ?? ticket.feePaid ?? 0),
      buyerEmail: ticket.buyer_email || ticket.buyerEmail || '',
      buyerName: ticket.buyer_name || ticket.buyerName || '',
      eventId: ticket.event_id || ticket.eventId || '',
      paymentGateway: ticket.payment_gateway || ticket.paymentGateway || 'paystack',
      isReselling: Boolean(ticket.is_reselling ?? ticket.isReselling ?? false),
      resalePrice: ticket.resale_price ?? ticket.resalePrice ?? undefined,
      isValidated: Boolean(ticket.is_validated ?? ticket.isValidated ?? false),
      validatedAt: ticket.validated_at ?? ticket.validatedAt ?? undefined,
    }));

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('Failed to load tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to load tickets. Please try again later.' },
      { status: 500 }
    );
  }
}
