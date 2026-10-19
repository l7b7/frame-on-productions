import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Studio from '@/components/frame/Studio';
import { getSettings, listEntries } from '@/lib/runtime';
export const dynamic = 'force-dynamic';
export async function generateMetadata({params}: {params: Promise<{lang: string}>}): Promise<Metadata> {
  const {lang} = await params;
  return { title: lang === 'en' ? 'Film, creativity & digital experiences' : 'إنت تتخيّل… وإحنا نصنع المشهد', alternates: { canonical: `/${lang}`, languages: { ar: '/ar', en: '/en' } }, openGraph: {locale: lang === 'en' ? 'en_US' : 'ar_IQ'} };
}
export default async function Page({params}: {params: Promise<{lang: string}>}) {
  const {lang} = await params; if (lang !== 'ar' && lang !== 'en') notFound();
  const [entries, settings] = await Promise.all([listEntries(),getSettings()]);
  return <Studio lang={lang} initial={{entries,settings}} />;
}
