import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // 1. Find the user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // 2. Verify the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // 3. Strip the password hash before sending the user data back to the frontend
    const { password_hash, ...safeUser } = user;

    return NextResponse.json(
      { message: 'Login successful', user: safeUser },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}