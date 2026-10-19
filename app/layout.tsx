import type { Metadata, Viewport } from 'next';
import './globals.css';
import './experience.css';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'FRAME ON PRODUCTIONS | فريم أون للإنتاج الإعلامي', template: '%s | FRAME ON' },
  description: 'إنت تتخيّل… وإحنا نصنع المشهد. إنتاج إعلامي، إعلانات، أفلام، تسويق، ومواقع إلكترونية من فريم أون.',
  icons: { icon: '/brand-logo-transparent.png', apple: '/brand-logo-transparent.png' },
  openGraph: { title: 'FRAME ON PRODUCTIONS', description: 'إنت تتخيّل… وإحنا نصنع المشهد.', images: ['/brand-logo.jpg'], type: 'website' },
};
export const viewport: Viewport = { themeColor: '#0B0B0F', width: 'device-width', initialScale: 1 };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="ar" dir="rtl" suppressHydrationWarning><body>{children}</body></html>; }
