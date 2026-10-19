import { passwordLogin } from '@/lib/runtime';
import { failure } from '@/lib/api';
export async function POST(request:Request){try{return await passwordLogin(request);}catch(error){return failure(error);}}
