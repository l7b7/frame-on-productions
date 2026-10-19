import { completeUpload } from '@/lib/runtime';
import { mediaSchema } from '@/lib/validation';
import { authorize, body, json, failure } from '@/lib/api';
export async function POST(request:Request){try{await authorize(request);const media=mediaSchema.parse(await body(request));return json({media:await completeUpload(media)});}catch(e){return failure(e);}}
