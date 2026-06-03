import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    // 1. Extract data from the frontend JSON payload
    const body = await request.json();
    const { email, password, full_name, role = 'buyer' } = body;

    // 2. Validate input
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required.' },
        { status: 400 }
      );
    }

    // 3. Check if user already exists in our database
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // 4. Hash the password for ultimate security (Salt rounds: 10)
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 5. Insert the new user into our PostgreSQL 'users' table
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash,
          full_name,
          role,
          is_verified: false, // They must verify OTP later
        }
      ])
      .select('id, email, full_name, role, is_verified')
      .single();

    if (insertError) {
      console.error('DB Insert Error:', insertError);
      return NextResponse.json({ error: 'Failed to create user account.' }, { status: 500 });
    }

    // 6. Return Success to the Frontend
    return NextResponse.json(
      { message: 'User registered successfully!', user: newUser },
      { status: 201 }
    );

  } catch (error) {
    console.error('Server Auth Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}