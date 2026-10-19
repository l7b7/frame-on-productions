import { adminSession } from '@/lib/runtime';
import { json, failure } from '@/lib/api';
export const dynamic = 'force-dynamic';
export async function GET() {try {return json(await adminSession());} catch(e){return failure(e);}}
