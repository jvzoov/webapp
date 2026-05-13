import type { Metadata, Viewport } from 'next';
import { Noto_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  title: 'QueuePe — Skip the Line',
  description: 'Book verified queue-standers at any government office in India',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'QueuePe',
  },
  icons: {
    apple: '/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FF6B00',
  viewportFit: 'cover',
};

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${notoSans.variable} ${dmMono.variable} font-body antialiased h-full bg-[#1A1612]`}>
        <SessionProvider>
          <div className="min-h-full flex flex-col">
            {children}
          </div>
          <Toaster 
            position="top-center" 
            toastOptions={{
              className: 'bg-[#1A1612] text-[#f5ede0] font-body text-sm rounded-[10px] border border-[#362a16]',
              duration: 3000,
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}
