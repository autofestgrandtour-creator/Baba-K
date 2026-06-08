import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function PATCH(request: Request) {
  try {
    const { ticketId, resalePrice, isReselling } = await request.json();

    if (!ticketId) {
      return NextResponse.json(
        { success: false, error: 'Missing ticketId in request body.' },
        { status: 400 }
      );
    }

    const updatePayload: any = {};
    if (isReselling === false) {
      updatePayload.is_reselling = false;
      updatePayload.resale_price = null;
    } else {
      const price = Number(resalePrice);
      if (Number.isNaN(price) || price <= 0) {
        return NextResponse.json(
          { success: false, error: 'A valid resalePrice greater than zero is required.' },
          { status: 400 }
        );
      }
      updatePayload.is_reselling = true;
      updatePayload.resale_price = price;
    }

    const { error } = await supabase
      .from('purchased_tickets')
      .update(updatePayload)
      .eq('id', ticketId);

    if (error) {
      console.error('Resale update failed:', error);
      return NextResponse.json(
        { success: false, error: 'Unable to update ticket resale status.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, ticketId, ...updatePayload });
  } catch (error) {
    console.error('Resale route error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error updating resale.' },
      { status: 500 }
    );
  }
}
