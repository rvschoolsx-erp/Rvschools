import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { BrandProvider } from '@/contexts/BrandContext';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'SchoolConnect — Smart School Management Software',
    template: '%s | SchoolConnect',
  },
  description: 'SchoolConnect — Complete School ERP with Parent Portal, Attendance, Marks, Fee Management & Analytics',
  keywords: ['school erp', 'school management software', 'parent portal', 'school connect', 'school management india'],
  authors: [{ name: 'SchoolConnect' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'SchoolConnect — Smart School Management Software',
    description: 'Complete School ERP with Parent Portal, Attendance, Marks, Fee Management & Analytics',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1a3c6e' },
    { media: '(prefers-color-scheme: dark)',  color: '#0f2140' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <BrandProvider>
            {children}
            </BrandProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '8px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
