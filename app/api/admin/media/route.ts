import { uploadMedia, signUpload, removeMedia } from '@/lib/runtime';
import { MAX_MEDIA_BYTES, supportedMimes, extension } from '@/lib/validation';
import { authorize, body, json, failure, HttpError } from '@/lib/api';
export async function POST(request:Request){try{
  await authorize(request);
  if(request.headers.get('content-type')?.includes('application/json')){
    const value=await body(request);if(!supportedMimes.includes(value.mime)||!Number.isSafeInteger(value.size)||value.size<=0||value.size>MAX_MEDIA_BYTES||typeof value.name!=='string'||value.name.length>180)throw new HttpError(400,'صيغة أو حجم الملف غير مسموح.');
    const media={key:`media/${crypto.randomUUID()}.${extension(value.mime)}`,mime:value.mime,size:value.size,name:value.name};const signed=await signUpload(media);return json({mode:signed?'direct':'form',media,...(signed||{})});
  }
  if(Number(request.headers.get('content-length')||0)>MAX_MEDIA_BYTES+10000)throw new HttpError(413,'الحد الأقصى للملف 30 MB.');
  const form=await request.formData();const file=form.get('file');if(!(file instanceof File)||!supportedMimes.includes(file.type)||!file.size||file.size>MAX_MEDIA_BYTES)throw new HttpError(400,'استخدم JPG أو PNG أو WebP أو MP4 أو WebM حتى 30 MB.');
  const media={key:`media/${crypto.randomUUID()}.${extension(file.type)}`,name:file.name.slice(0,180),mime:file.type,size:file.size};return json({media:await uploadMedia(file,media)},201);
}catch(e){return failure(e);}}
export async function DELETE(request:Request){try{await authorize(request);const {key}=await body(request);if(typeof key!=='string'||!/^media\/[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$/.test(key))throw new HttpError(400,'ملف غير صحيح.');await removeMedia(key);return json({ok:true});}catch(e){return failure(e);}}
