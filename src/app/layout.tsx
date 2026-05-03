import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
import './globals.css';

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'QueuePe — Skip The Line',
  description:
    'India\'s queue-standing marketplace. Book a verified Stander to hold your spot at any RTO, hospital, bank or government office.',
  keywords: ['queue', 'RTO', 'passport', 'India', 'queuepe', 'line standing'],
  openGraph: {
    title: 'QueuePe — Skip The Line',
    description: 'Book a verified Stander to hold your spot.',
    type: 'website',
  },
};

import NextAuthProvider from '@/components/providers/NextAuthProvider';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={notoSans.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Noto+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
