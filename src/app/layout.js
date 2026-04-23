import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'The Growth Family',
  description: 'Community gaming hub and leaderboard.',
};

import Script from 'next/script';
import { Providers } from '../components/Providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="container">
            {children}
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
