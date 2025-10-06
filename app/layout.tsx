'use client';

import './globals.css';
// import { Inter } from 'next/font/google'; // Commented out due to network connectivity issues
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth-context';
import ErrorBoundary from '@/components/error-boundary';
import { useState } from 'react';

// const inter = Inter({ subsets: ['latin'] }); // Commented out due to network connectivity issues

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, 
        retry: 1,
      },
    },
  }));

  return (
    <html lang="en">
      <head>
        <title>EduBridge - Academic Communication Platform</title>
        <meta name="description" content="Modern academic communication platform for lecturers and students" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-sans">
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              {children}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </AuthProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}