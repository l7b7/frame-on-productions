import { passwordLogout } from '@/lib/runtime';
export async function POST(request:Request){const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return new Response('Forbidden',{status:403});return passwordLogout();}
