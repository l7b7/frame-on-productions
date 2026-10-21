import { saveEntry, deleteEntry, mediaExists, listEntries, removeMedia } from '@/lib/runtime';
import { entrySchema } from '@/lib/validation';
import { authorize, body, json, failure, HttpError } from '@/lib/api';
type Context={params:Promise<{id:string}>};
export const maxDuration = 60;
export async function PUT(request: Request,context:Context) {try {
  await authorize(request); const {id}=await context.params;const old=(await listEntries(true)).find(e=>e.id===id);if(!old) throw new HttpError(404,'المحتوى غير موجود.');
  const value=entrySchema.parse(await body(request));if((await Promise.all(value.media.map(mediaExists))).some(exists=>!exists)) throw new HttpError(400,'أحد الملفات غير موجود.');
  const entry={...value,id,createdAt:old.createdAt,updatedAt:new Date().toISOString()};await saveEntry(entry,true);return json({entry});
}catch(e){return failure(e);}}
export async function DELETE(request:Request,context:Context){try{await authorize(request);const {id}=await context.params;const old=(await listEntries(true)).find(e=>e.id===id);await deleteEntry(id);if(old){const clean=await Promise.allSettled(old.media.map(m=>removeMedia(m.key)));for(const r of clean)if(r.status==='rejected')console.error('Media cleanup deferred:',r.reason);}return json({ok:true});}catch(e){return failure(e);}}
