/** All admin control requests are small JSON; file bytes go directly to Storage. */
export async function adminRequest<T>(path: string, options: RequestInit = {}, timeout = 25000): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  const timer = setTimeout(abort, timeout);
  try {
    const response = await fetch(path, { ...options, cache: 'no-store', signal: controller.signal });
    const raw = await response.text();
    let data: unknown;
    try { data = JSON.parse(raw); } catch { /* Proxy errors may return text or HTML. */ }
    const fallback = response.status === 413 ? "الطلب أكبر من الحد المسموح ارفع الملفات من أداة الرفع المباشر"
      : response.status === 401 ? "انتهت جلسة الإدارة سجّل دخولك من جديد"
      : response.status === 403 ? "الحساب غير مخوّل بهذا الإجراء"
      : response.status === 504 ? "تأخر رد الخادم أعد المحاولة؛ الملف المرفوع محفوظ للتأكد منه"
      : `تعذّر إكمال الطلب (HTTP ${response.status}). جرّب مرة ثانية.`;
    if (!response.ok) throw new Error(data && typeof data === 'object' && 'error' in data ? String(data.error) : fallback);
    if (!data || typeof data !== 'object') throw new Error(`وصل رد غير صالح من الخادم (HTTP ${response.status}). أعد المحاولة.`);
    return data as T;
  } catch (error) {
    if (controller.signal.aborted) throw new Error(options.signal?.aborted ? "تم إيقاف الرفع" : "تأخر الاتصال بالخادم تأكد من الإنترنت وأعد المحاولة");
    if (error instanceof TypeError) throw new Error("انقطع الاتصال تأكد من الإنترنت وأعد المحاولة");
    throw error;
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', abort);
  }
}
export const asJson = (method: string, value: unknown): RequestInit => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
