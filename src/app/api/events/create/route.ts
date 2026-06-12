import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      organizer_id, 
      title, 
      description, 
      location, 
      event_date, 
      flyer_url,
      ticket_tiers // Array of objects e.g., [{ name: 'VIP', price: 50000, capacity: 100 }]
    } = body;

    // 1. Basic Validation
    if (!organizer_id || !title || !location || !event_date || !ticket_tiers) {
      return NextResponse.json({ error: 'Missing required event fields.' }, { status: 400 });
    }

    // 2. Insert the Event into the 'events' table
    // Replace your current insert block with this logic:

// 1. Combine the date and time strings into one valid database timestamp
const combinedDateTime = new Date(`${eventDate}T${time || '00:00'}:00`).toISOString();

// 2. Insert into Supabase (Notice 'time' is completely removed here)
const { data: newEvent, error: eventError } = await supabase
  .from('events')
  .insert({
    organizer_id: organizerId,
    title,
    description,
    location,
    event_date: combinedDateTime, // <--- Merged date and time here
    flyer_url: flyerUrl,
    category,
    is_promoted: isPromoted,
    state: 'active'
  })
  .select()
  .single();

    if (eventError || !newEvent) {
      console.error('Event Insert Error:', eventError);
      return NextResponse.json({ error: 'Failed to create event.' }, { status: 500 });
    }

    // 3. Prepare the Ticket Tiers payload
    // We loop through the tiers sent from the frontend and attach the new event's ID
    const tiersToInsert = ticket_tiers.map((tier: any) => ({
      event_id: newEvent.id,
      name: tier.name,
      price: tier.price,
      capacity: tier.capacity,
      sold_count: 0
    }));

    // 4. Insert into the 'ticket_types' table
    const { error: tiersError } = await supabase
      .from('ticket_types')
      .insert(tiersToInsert);

    if (tiersError) {
      console.error('Tiers Insert Error:', tiersError);
      return NextResponse.json({ error: 'Event created, but failed to add ticket tiers.' }, { status: 500 });
    }

    // 5. Success!
    return NextResponse.json(
      { message: 'Event and Ticket Tiers created successfully!', event_id: newEvent.id },
      { status: 201 }
    );

  } catch (error) {
    console.error('Event Creation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}