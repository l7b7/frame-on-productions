import { signUpload, removeMedia } from '@/lib/runtime';
import { MAX_MEDIA_BYTES, supportedMimes, extension, mediaKeyPattern } from '@/lib/validation';
import { authorize, body, json, failure, HttpError } from '@/lib/api';
export const maxDuration = 60;
export async function POST(request:Request){try{
  await authorize(request);
  // Only metadata passes through Vercel; file bytes go straight to Storage.
  if(!request.headers.get('content-type')?.includes('application/json'))throw new HttpError(415,'استخدم أداة الرفع المباشر. الخادم يستقبل معلومات الملف فقط.');
  const value=await body(request);
  if(!value||typeof value!=='object'||!supportedMimes.includes(value.mime)||!Number.isSafeInteger(value.size)||value.size<=0||value.size>MAX_MEDIA_BYTES||typeof value.name!=='string'||!value.name.trim()||value.name.length>180)throw new HttpError(400,'استخدم صورة أو فيديو بصيغة مدعومة حتى 50 MB. للفيديو الأكبر أضف رابط YouTube أو Vimeo.');
  const media={key:`media/${crypto.randomUUID()}.${extension(value.mime)}`,mime:value.mime,size:value.size,name:value.name.trim()};
  return json({mode:'tus',media,...await signUpload(media)});
}catch(e){return failure(e);}}
export async function DELETE(request:Request){try{await authorize(request);const {key}=await body(request);if(typeof key!=='string'||!mediaKeyPattern.test(key))throw new HttpError(400,'ملف غير صحيح.');await removeMedia(key);return json({ok:true});}catch(e){return failure(e);}}
