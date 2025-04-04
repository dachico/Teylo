// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthSessionProvider from '@/components/auth/SessionProvider';
import { NotificationProvider } from '@/contexts/NotificationContext';
import Notifications from '@/components/ui/Notifications';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Game Generator',
  description: 'Create 3D games using AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <AuthSessionProvider>
          <NotificationProvider>
            {children}
            <Notifications />
          </NotificationProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}