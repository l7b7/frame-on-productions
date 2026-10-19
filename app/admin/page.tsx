import type { Metadata } from 'next';
import Admin from '@/components/frame/Admin';
export const metadata: Metadata = {title:'لوحة إدارة فريم أون',robots:{index:false,follow:false}};
export const dynamic = 'force-dynamic';
export default function Page(){return <Admin/>;}
