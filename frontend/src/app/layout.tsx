import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Instrument_Serif, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ClientPro CRM - Gestión de Clientes',
  description: 'Sistema de gestión de relaciones con clientes',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable}`}
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
