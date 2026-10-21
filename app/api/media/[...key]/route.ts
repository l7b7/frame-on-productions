import { mediaKeyPattern } from '@/lib/validation';
import { readMedia } from '@/lib/runtime';
export const dynamic = 'force-dynamic';
export async function GET(request:Request,{params}:{params:Promise<{key:string[]}>}){const {key}=await params;const path=key.join('/');if(!mediaKeyPattern.test(path))return new Response('Not found',{status:404});return readMedia(path,request);}
