// Replaces lib/runtime.ts in the standalone Next.js / Vercel export.
// All database and storage credentials remain server-side.
import { cookies } from 'next/headers';
import { defaultSettings, type Entry, type Settings, type Media } from '@/lib/content';
import { validSignature, MAX_MEDIA_BYTES } from '@/lib/validation';
import { HttpError } from '@/lib/errors';
export type AdminSession = { authenticated:boolean; authorized:boolean; name:string; mode:'sites'|'supabase'; configured:boolean; configurationMissing?:string[]; signInUrl:string; signOutUrl:string };
const cleanEnv=(value:string|undefined)=>value?.trim()||'';
const config=()=>({url:cleanEnv(process.env.SUPABASE_URL).replace(/\/$/,''),anon:cleanEnv(process.env.SUPABASE_PUBLISHABLE_KEY)||cleanEnv(process.env.SUPABASE_ANON_KEY),service:cleanEnv(process.env.SUPABASE_SECRET_KEY)||cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)});
const missingConfiguration=()=>{const c=config();return [['SUPABASE_URL',c.url],['SUPABASE_PUBLISHABLE_KEY',c.anon],['SUPABASE_SECRET_KEY',c.service]].filter(([,value])=>!value).map(([name])=>name);};
const bucketName='frameon-media';
const isConfigured=()=>missingConfiguration().length===0;
async function service(path:string,init:RequestInit={}):Promise<Response>{const c=config();if(!isConfigured())throw new Error("Supabase is not configured");const headers=new Headers(init.headers);headers.set('apikey',c.service);if(c.service.startsWith('sb_secret_'))headers.delete('Authorization');else headers.set('Authorization',`Bearer ${c.service}`);return fetch(`${c.url}${path}`,{...init,headers,cache:'no-store'});}
async function must(res:Response){if(!res.ok){console.error('Storage/database response',res.status);throw new Error("Database or storage request failed");}return res;}
async function tokenUser(token:string){const c=config();const r=await fetch(`${c.url}/auth/v1/user`,{headers:{apikey:c.anon,Authorization:`Bearer ${token}`},cache:'no-store'});return r.ok?await r.json() as {id:string;email?:string}:null;}
async function isAdmin(userId:string):Promise<boolean>{
  const q=new URLSearchParams({select:'is_active',user_id:`eq.${userId}`,limit:'1'});
  const r=await service(`/rest/v1/frame_admins?${q}`);
  if(!r.ok)throw new HttpError(503,"تعذّر التحقق من صلاحيات الإدارة راجع إعدادات قاعدة البيانات");
  const rows=await r.json() as {is_active:boolean}[];
  return rows.length===1&&rows[0].is_active===true;
}
async function setSession(tokens:{access_token:string;refresh_token:string;expires_in?:number}){const jar=await cookies();const base={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict' as const,path:'/'};jar.set('frame_session',tokens.access_token,{...base,maxAge:Math.max(60,Math.min(tokens.expires_in||3600,3600))});jar.set('frame_refresh',tokens.refresh_token,{...base,maxAge:60*60*24*7});}
export async function adminSession():Promise<AdminSession>{
  const empty:AdminSession={authenticated:false,authorized:false,name:'',mode:'supabase',configured:isConfigured(),configurationMissing:missingConfiguration(),signInUrl:'/admin',signOutUrl:'/admin'};
  if(!isConfigured())return empty;const jar=await cookies();const token=jar.get('frame_session')?.value;let user=token?await tokenUser(token):null;let authorized=false;
  if(user)authorized=await isAdmin(user.id);
  else{const refresh=jar.get('frame_refresh')?.value;if(refresh){const c=config();const r=await fetch(`${c.url}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:{apikey:c.anon,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:refresh}),cache:'no-store'});if(r.ok){const tokens=await r.json() as {access_token:string;refresh_token:string;expires_in:number};user=await tokenUser(tokens.access_token);if(user){authorized=await isAdmin(user.id);if(authorized)await setSession(tokens);}}}}
  return {...empty,authenticated:!!user,authorized,name:user?.email||''};
}
function mapEntry(r:Record<string,unknown>):Entry{return {id:String(r.id),kind:r.kind as Entry['kind'],category:String(r.category),titleAr:String(r.title_ar),titleEn:String(r.title_en),descriptionAr:String(r.description_ar),descriptionEn:String(r.description_en),media:r.media as Media[]||[],videoUrl:String(r.video_url||''),published:!!r.published,featured:!!r.featured,createdAt:String(r.created_at),updatedAt:String(r.updated_at)};}
export async function listEntries(includeDrafts=false):Promise<Entry[]>{if(!isConfigured())return [];const q=new URLSearchParams({select:'*',order:'featured.desc,created_at.desc',limit:'250'});if(!includeDrafts)q.set('published','eq.true');const res=await must(await service(`/rest/v1/entries?${q}`));const rows=await res.json() as Record<string,unknown>[];return rows.map(mapEntry);}
export async function getSettings():Promise<Settings>{if(!isConfigured())return structuredClone(defaultSettings);const r=await must(await service('/rest/v1/site_settings?id=eq.main&select=value'));const rows=await r.json() as {value:Settings}[];const value=rows[0]?.value;return value?{...defaultSettings,...value,socials:{...defaultSettings.socials,...value.socials}}:structuredClone(defaultSettings);}
export async function saveSettings(value:Settings){await must(await service('/rest/v1/site_settings',{method:'POST',headers:{'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'},body:JSON.stringify({id:'main',value})}));}
export async function saveEntry(e:Entry,update=false){const row={id:e.id,kind:e.kind,category:e.category,title_ar:e.titleAr,title_en:e.titleEn,description_ar:e.descriptionAr,description_en:e.descriptionEn,media:e.media,video_url:e.videoUrl,featured:e.featured,published:e.published,created_at:e.createdAt,updated_at:e.updatedAt};await must(await service(`/rest/v1/entries${update?"?id=eq."+encodeURIComponent(e.id):''}`,{method:update?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(row)}));}
export async function deleteEntry(id:string){await must(await service(`/rest/v1/entries?id=eq.${encodeURIComponent(id)}`,{method:'DELETE'}));}
const storagePath=(key:string)=>`/storage/v1/object/${bucketName}/${key}`;
async function inspectMedia(media:Media):Promise<boolean>{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
  let reader:ReadableStreamDefaultReader<Uint8Array>|undefined;
  try{
    const r=await service(storagePath(media.key),{headers:{Range:'bytes=0-31'},signal:controller.signal});
    if(r.status===404)return false;
    if(!r.ok)throw new HttpError(503,"التخزين مشغول حالياً أعد تأكيد الملف بدون رفعه من جديد");
    const size=Number(r.headers.get('content-range')?.split('/')[1]||r.headers.get('content-length'));const mime=r.headers.get('content-type')?.split(';')[0];
    reader=r.body?.getReader();if(!reader)return false;
    const bytes=new Uint8Array(32);let count=0;
    while(count<32){const chunk=await reader.read();if(chunk.done)break;const part=chunk.value.subarray(0,32-count);bytes.set(part,count);count+=part.length;}
    return size===media.size&&size<=MAX_MEDIA_BYTES&&mime===media.mime&&validSignature(bytes.subarray(0,count),media.mime);
  }catch(error){if(controller.signal.aborted)throw new HttpError(504,"تأخر التحقق من الملف أعد التأكيد؛ ما تحتاج ترفعه من جديد");throw error;}
  finally{
    // Do not await cancellation of Next.js' wrapped stream when Storage ignores
    // Range and serves the full object: that can stall an otherwise valid upload.
    if(reader)void reader.cancel().catch(()=>{});
    controller.abort();clearTimeout(timer);
  }
}
export async function uploadMedia(file:File,media:Media){if(file.size>4*1024*1024)throw new Error("Use direct upload for large files");const bytes=new Uint8Array(await file.arrayBuffer());if(!validSignature(bytes.slice(0,32),media.mime))throw new Error("Invalid file contents");await must(await service(storagePath(media.key),{method:'POST',headers:{'Content-Type':media.mime,'x-upsert':'false'},body:bytes}));return media;}
export async function signUpload(media:Media):Promise<{endpoint:string;token:string;bucket:string}>{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
  try{
    const r=await service(`/storage/v1/object/upload/sign/${bucketName}/${media.key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:controller.signal});
    if(!r.ok)throw new HttpError(503,"تعذّر تجهيز الرفع في التخزين تأكد من إعدادات حاوية الملفات وأعد المحاولة");
    const data=await r.json() as {url:string};const base=new URL(config().url);
    const url=new URL(`${base.origin}/storage/v1${data.url}`);const token=url.searchParams.get('token');
    if(url.origin!==base.origin||!token)throw new Error("Unexpected upload endpoint");
    if(base.hostname.endsWith('.supabase.co'))base.hostname=base.hostname.replace(/\.supabase\.co$/,'.storage.supabase.co');
    return {endpoint:`${base.origin}/storage/v1/upload/resumable`,token,bucket:bucketName};
  }catch(error){if(controller.signal.aborted)throw new HttpError(504,"تأخر تجهيز الرفع جرّب مرة ثانية");throw error;}
  finally{clearTimeout(timer);}
}
export async function completeUpload(media:Media){if(!await inspectMedia(media))throw new HttpError(400,"الملف غير مكتمل أو نوعه لا يطابق محتواه اختر الملف الأصلي بصيغة مدعومة");return media;}
export async function mediaExists(media:Media){return inspectMedia(media);}
async function hasReference(key:string,publishedOnly=false){const q=new URLSearchParams({select:'id',media:"cs."+JSON.stringify([{key}]),limit:'1'});if(publishedOnly)q.set('published','eq.true');const r=await must(await service(`/rest/v1/entries?${q}`));return ((await r.json()) as unknown[]).length>0;}
export async function removeMedia(key:string){if(await hasReference(key))throw new Error("This file is still used by an entry");await must(await service(storagePath(key),{method:'DELETE'}));}
export async function readMedia(key:string,request:Request){if(!isConfigured())return new Response('Not found',{status:404});if(!await hasReference(key,true)&&!(await adminSession()).authorized)return new Response('Not found',{status:404});const headers=new Headers();const range=request.headers.get('range');if(range&&/^bytes=\d*-\d*$/.test(range))headers.set('Range',range);const r=await service(storagePath(key),{headers});if(!r.ok)return new Response('Not found',{status:r.status===416?416:404});const out=new Headers({'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'});for(const k of ['Content-Type','Content-Length','Content-Range','ETag']){const v=r.headers.get(k);if(v)out.set(k,v);}return new Response(r.body,{status:r.status,headers:out});}
export async function passwordLogin(request:Request):Promise<Response>{
  const generic=()=>Response.json({error:"البريد أو كلمة المرور غير صحيح، أو هذا الحساب غير مخوّل"},{status:401,headers:{'Cache-Control':'no-store'}});
  if(request.headers.get('origin')!==new URL(request.url).origin)return new Response('Forbidden',{status:403});
  if(!isConfigured())return Response.json({error:`إعدادات Vercel الناقصة في النسخة الحالية: ${missingConfiguration().join('، ')}. أضف القيم إلى Production بالمشروع المرتبط بهذا الرابط ثم أعد النشر.`,configurationMissing:missingConfiguration()},{status:503,headers:{'Cache-Control':'no-store'}});
  if(!request.headers.get('content-type')?.includes('application/json'))return new Response('Invalid request',{status:415});
  const raw=await request.text();if(raw.length>5000)return new Response('Request too large',{status:413});let payload:{email?:unknown;password?:unknown};try{payload=JSON.parse(raw);}catch{return generic();}
  if(typeof payload.email!=='string'||typeof payload.password!=='string'||payload.email.length>254||payload.password.length>256)return generic();
  const c=config();const r=await fetch(`${c.url}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:c.anon,'Content-Type':'application/json'},body:JSON.stringify({email:payload.email,password:payload.password}),cache:'no-store'});if(!r.ok)return generic();const data=await r.json() as {access_token:string;refresh_token:string;expires_in:number;user:{id:string}};if(!data.user?.id||!await isAdmin(data.user.id))return generic();await setSession(data);return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
}
export async function passwordLogout(){const jar=await cookies();const c=config();const token=jar.get('frame_session')?.value;try{if(token&&c.url&&c.anon)await fetch(`${c.url}/auth/v1/logout`,{method:'POST',headers:{apikey:c.anon,Authorization:`Bearer ${token}`}});}finally{jar.delete('frame_session');jar.delete('frame_refresh');}return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});}
