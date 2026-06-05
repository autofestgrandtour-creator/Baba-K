"use client";

import { PlatformProvider } from "@/context/PlatformContext";

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <PlatformProvider>{children}</PlatformProvider>;
}
