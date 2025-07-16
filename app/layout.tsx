'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

function ClientRedirector() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (
      status === 'authenticated' &&
      session?.user?.needsProfileCompletion &&
      pathname !== '/auth/complete-profile'
    ) {
      router.replace('/auth/complete-profile');
    }
  }, [session, status, pathname, router]);
  return null;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          <ClientRedirector />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
} 