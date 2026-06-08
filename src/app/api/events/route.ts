import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const {
      organizerId,
      title,
      description,
      location,
      eventDate,
      time,
      flyerUrl,
      category,
      isPromoted,
      ticketTiers,
    } = await request.json();

    if (!organizerId || !title || !location || !eventDate || !Array.isArray(ticketTiers) || ticketTiers.length === 0) {
      return NextResponse.json({ success: false, message: 'Missing required event data.' }, { status: 400 });
    }

    const eventPayload = {
      title,
      description: description || 'No description provided.',
      location,
      event_date: eventDate,
      time: time || '19:00',
      flyer_url: flyerUrl,
      category: category || 'General',
      organizer_id: organizerId,
      is_promoted: Boolean(isPromoted),
      state: 'active',
    };

    const { data: createdEvent, error: eventError } = await supabase
      .from('events')
      .insert(eventPayload)
      .select('id')
      .single();

    if (eventError || !createdEvent?.id) {
      console.error('Event creation failed:', eventError);
      return NextResponse.json({ success: false, message: 'Unable to create event.' }, { status: 500 });
    }

    const tiersPayload = ticketTiers.map((tier: any) => ({
      event_id: createdEvent.id,
      name: tier.name,
      price: Number(tier.price) || 0,
      capacity: Number(tier.capacity) || 0,
      visibility: tier.visibility || 'Public',
      sold_count: tier.soldCount ?? 0,
    }));

    const { error: tierError } = await supabase.from('ticket_types').insert(tiersPayload);
    if (tierError) {
      console.error('Ticket tier insert failed:', tierError);
      await supabase.from('events').delete().eq('id', createdEvent.id);
      return NextResponse.json({ success: false, message: 'Unable to create event ticket tiers.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, event_id: createdEvent.id });
  } catch (error) {
    console.error('Event creation error:', error);
    return NextResponse.json({ success: false, message: 'Server error while creating event.' }, { status: 500 });
  }
}
