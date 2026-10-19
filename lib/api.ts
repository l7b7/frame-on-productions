import { adminSession } from './runtime';
import { HttpError } from './errors';
export { HttpError } from './errors';
export async function authorize(request?: Request) {
  if (request && !['GET','HEAD'].includes(request.method)) {
    const origin = request.headers.get('origin');
    if (!origin || origin !== new URL(request.url).origin) throw new HttpError(403,'طلب غير مسموح.');
  }
  const session = await adminSession();
  if (!session.authenticated) throw new HttpError(401,'سجّل دخولك أولاً.');
  if (!session.authorized) throw new HttpError(403,'الحساب غير مخوّل بإدارة الموقع.');
  if (!session.configured) throw new HttpError(503,'خدمات الحفظ غير مربوطة بعد.');
  return session;
}
export function json(data: unknown, status = 200) {return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
export async function body(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new HttpError(415,'Expected JSON.');
  const raw = await request.text(); if(raw.length>100000) throw new HttpError(413,'الطلب أكبر من الحد المسموح.');
  try {return JSON.parse(raw);} catch {throw new HttpError(400,'Invalid JSON.');}
}
export function failure(error: unknown) {
  if(error instanceof HttpError) return json({error:error.message},error.status);
  if(error && typeof error === 'object' && 'issues' in error) {const e = error as {issues: {message: string}[]}; return json({error:e.issues.map(i=>i.message).join(' — ')},400);}
  console.error('Frame On request failed:',error);return json({error:'تعذّر حفظ التغيير. جرّب مرة ثانية؛ وإذا استمرت المشكلة راجع إعدادات الخدمة.'},500);
}
