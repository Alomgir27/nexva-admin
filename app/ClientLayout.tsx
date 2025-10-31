"use client";

import { AuthProvider } from "./context/AuthContext";
import dynamic from "next/dynamic";

const NexvaChatWidget = dynamic(() => import('./components/NexvaChatWidget'), {
  ssr: false
});

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <NexvaChatWidget />
    </AuthProvider>
  );
}

