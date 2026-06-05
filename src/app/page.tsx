"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SplashScreen } from '@/components/SplashScreen';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // The luxury splash animation takes about 2.8 seconds.
    // We wait 3.2 seconds, then seamlessly transition to the Explore hub.
    const timer = setTimeout(() => {
      router.push('/explore');
    }, 3200);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-black">
      {/* We render the splash screen without expecting it to talk back. 
        Our useEffect timer above handles the heavy lifting.
      */}
      <SplashScreen />
    </main>
  );
}