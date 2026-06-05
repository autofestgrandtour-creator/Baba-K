import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request) {
  try {
    // 1. SECURITY CHECK: Ensure the requester is actually an Admin
    // (We assume the auth header passes the user context)
    // For this boilerplate, we'll keep it open but in production,
    // you must verify the user's session role is 'admin' here.

    // 2. Aggregate Data
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: totalEvents } = await supabase.from('events').select('*', { count: 'exact', head: true });
    const { count: ticketsSold } = await supabase.from('purchased_tickets').select('*', { count: 'exact', head: true });

    // 3. Aggregate Revenue
    const { data: revenueData } = await supabase.from('transactions').select('amount').eq('status', 'success');
    const totalRevenue = revenueData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalEvents: totalEvents || 0,
      ticketsSold: ticketsSold || 0,
      revenue: totalRevenue
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}