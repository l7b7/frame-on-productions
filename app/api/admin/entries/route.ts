import { listEntries, saveEntry, mediaExists } from '@/lib/runtime';
import { entrySchema } from '@/lib/validation';
import { authorize, body, json, failure, HttpError } from '@/lib/api';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export async function GET() {try {await authorize();return json({entries:await listEntries(true)});}catch(e){return failure(e);}}
export async function POST(request: Request) {try {
  await authorize(request); const value = entrySchema.parse(await body(request));
  if((await Promise.all(value.media.map(mediaExists))).some(exists=>!exists)) throw new HttpError(400,'أحد الملفات غير مكتمل أو غير موجود.');
  const now=new Date().toISOString(); const entry={...value,id:crypto.randomUUID(),createdAt:now,updatedAt:now};await saveEntry(entry);return json({entry},201);
}catch(e){return failure(e);}}
