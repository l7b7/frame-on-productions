'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Pause, Plus, RotateCcw, Upload } from 'lucide-react';
import type { Upload as TusUpload } from 'tus-js-client';
import type { Media } from '@/lib/content';
import { adminRequest, asJson } from '@/lib/admin-request';
import { formatBytes, prepareImage, type ImageQuality } from '@/lib/prepare-image';
import { MAX_MEDIA_BYTES, supportedMimes } from '@/lib/validation';

type Plan = { mode: 'tus'; endpoint: string; token: string; bucket: string; media: Media };
type Job = { original: File; file?: File; note?: string; plan?: Plan; transfer?: TusUpload; transferred?: boolean; done?: boolean };
type Progress = { name: string; index: number; total: number; bytes: number; size: number; stage: string; note: string };
type Props = { count: number; disabled: boolean; onUploaded: (media: Media) => void; onBusyChange: (busy: boolean) => void; onStart: () => void };

function storageError(error: unknown): Error {
  const status = (error as { originalResponse?: { getStatus(): number } })?.originalResponse?.getStatus();
  const message = status === 413 ? 'التخزين رفض حجم الملف. الحد الحالي 50 MB؛ للفيديو الأكبر استخدم رابط الفيديو الطويل.'
    : status === 401 || status === 403 ? 'انتهت صلاحية إذن الرفع. اختر الملف من جديد، وسجّل دخولك إذا طُلب منك.'
    : status === 409 ? 'يوجد رفع آخر لنفس الملف. أوقفه ثم أعد المحاولة.'
    : 'توقف الاتصال بالتخزين بعد عدة محاولات. اضغط «إعادة المحاولة» لاستكمال الرفع من هذه الصفحة.';
  return new Error(message);
}

export default function MediaUploader({ count, disabled, onUploaded, onBusyChange, onStart }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const jobs = useRef<Job[]>([]);
  const controller = useRef<AbortController | null>(null);
  const active = useRef<TusUpload | null>(null);
  const mounted = useRef(true);
  const [quality, setQuality] = useState<ImageQuality>('balanced');
  const [running, setRunning] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort(); void active.current?.abort(); }; }, []);

  async function transfer(job: Job, signal: AbortSignal) {
    const { Upload: ResumableUpload } = await import('tus-js-client');
    if (signal.aborted) throw new Error('تم إيقاف الرفع.');
    return new Promise<void>((resolve, reject) => {
      const cleanup = () => signal.removeEventListener('abort', stop);
      const stop = () => { void job.transfer?.abort(); cleanup(); reject(new Error('تم إيقاف الرفع.')); };
      // Reuse the same in-memory TUS upload on retry: it retains its URL/offset.
      // No file, auth token or signed URL is saved in localStorage.
      if (!job.transfer) job.transfer = new ResumableUpload(job.file!, {
        endpoint: job.plan!.endpoint,
        headers: { 'x-signature': job.plan!.token, 'x-upsert': 'false' },
        chunkSize: 6 * 1024 * 1024,
        retryDelays: [0, 1000, 3000, 5000, 10000],
        storeFingerprintForResuming: false,
        uploadDataDuringCreation: true,
        metadata: { bucketName: job.plan!.bucket, objectName: job.plan!.media.key, contentType: job.file!.type, cacheControl: '3600' },
      });
      const upload = job.transfer;
      upload.options.onProgress = (bytes, size) => { if (mounted.current) setProgress(value => value ? { ...value, bytes, size, stage: bytes === size ? 'نكمّل نقل الملف…' : 'جاري الرفع…' } : value); };
      upload.options.onError = uploadError => { cleanup(); reject(storageError(uploadError)); };
      upload.options.onSuccess = () => { cleanup(); resolve(); };
      signal.addEventListener('abort', stop, { once: true });
      active.current = upload;
      upload.start();
    });
  }

  async function run() {
    if (controller.current) return;
    const attempt = new AbortController();
    controller.current = attempt;
    setRunning(true); onBusyChange(true); onStart(); setError(''); setMessage(''); setPending(true);
    try {
      for (const [index, job] of jobs.current.entries()) {
        if (job.done) continue;
        setProgress({ name: job.original.name, index: index + 1, total: jobs.current.length, bytes: 0, size: job.file?.size || job.original.size, stage: 'نجهّز الملف…', note: job.note || '' });
        if (!job.file) {
          const prepared = await prepareImage(job.original, quality);
          job.file = prepared.file;
          job.note = prepared.note;
          setProgress(value => value ? { ...value, size: prepared.file.size, note: prepared.note } : value);
        }
        if (attempt.signal.aborted) throw new Error('تم إيقاف الرفع.');
        if (job.file.size > MAX_MEDIA_BYTES) throw new Error(`حجم «${job.original.name}» ${formatBytes(job.file.size)}، أكبر من حد التخزين 50 MB. للفيديو الطويل أضف رابط YouTube أو Vimeo. الصور يمكن ضغطها بمستوى «حجم أصغر».`);
        if (!job.plan) job.plan = await adminRequest<Plan>('/api/admin/media', { ...asJson('POST', { name: job.file.name.slice(0, 180), mime: job.file.type, size: job.file.size }), signal: attempt.signal });
        if (!job.transferred) { await transfer(job, attempt.signal); job.transferred = true; }
        if (attempt.signal.aborted) throw new Error('تم إيقاف الرفع.');
        setProgress(value => value ? { ...value, bytes: job.file!.size, stage: 'وصل الملف. نتحقق منه…' } : value);
        const result = await adminRequest<{ media: Media }>('/api/admin/media/complete', { ...asJson('POST', job.plan.media), signal: attempt.signal });
        job.done = true;
        onUploaded(result.media);
      }
      jobs.current = []; setPending(false); setProgress(value => value ? { ...value, stage: 'اكتمل رفع الملفات.' } : value); setMessage('اكتمل رفع الملفات. احفظ المحتوى حتى يرتبط بيها.');
    } catch (uploadError) {
      if (mounted.current) {
        setProgress(value => value ? { ...value, stage: attempt.signal.aborted ? 'متوقف مؤقتاً.' : 'الرفع يحتاج إعادة محاولة.' } : value);
        if (attempt.signal.aborted) setMessage('الرفع متوقف مؤقتاً. تگدر تكمّله من هذه الصفحة.');
        else setError((uploadError as Error).message);
      }
    } finally {
      controller.current = null; active.current = null;
      if (mounted.current) { setRunning(false); onBusyChange(false); }
    }
  }

  function choose(files: FileList | null) {
    if (!files?.length || running || disabled || pending) return;
    const selected = Array.from(files);
    if (input.current) input.current.value = '';
    setError(''); setMessage('');
    if (count + selected.length > 12) { setError('تگدر تضيف حتى 12 ملف لكل محتوى.'); return; }
    if (selected.some(file => !supportedMimes.includes(file.type) || !file.size)) { setError('اختر JPG أو PNG أو WebP أو GIF أو MP4 أو WebM. الملف لازم يحتوي بيانات.'); return; }
    if (selected.some(file => file.size > 100 * 1024 * 1024 && ['image/jpeg', 'image/png'].includes(file.type))) { setError('الصورة أكبر من 100 MB. قلّل أبعادها أولاً حتى يگدر المتصفح يعالجها.'); return; }
    const large = selected.find(file => file.size > MAX_MEDIA_BYTES && !['image/jpeg', 'image/png'].includes(file.type));
    if (large) { setError(`حجم «${large.name}» ${formatBytes(large.size)}. الحد الحالي 50 MB للملف؛ للفيديو الأكبر استخدم خيار «فيديو طويل برابط».`); return; }
    jobs.current = selected.map(original => ({ original }));
    if (input.current) input.current.value = '';
    void run();
  }

  const percent = progress ? Math.min(100, Math.floor(progress.bytes / progress.size * 100)) : 0;
  return <section className="media-uploader" aria-label="رفع الصور والفيديوهات">
    <label className="compression-choice">جودة الصور قبل الرفع<select value={quality} disabled={running || pending || disabled} onChange={event => setQuality(event.target.value as ImageQuality)}><option value="balanced">جودة عالية وحجم مناسب</option><option value="small">حجم أصغر</option><option value="original">الملف الأصلي</option></select></label>
    <p className="upload-help">نضغط الصور الثابتة قبل رفعها ونحافظ على الصور المتحركة. الفيديو يُرفع بجودته الأصلية.</p>
    <div className={`upload-zone ${running ? 'uploading' : ''}`} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); choose(event.dataTransfer.files); }}>
      <Upload size={30}/><h3>اسحب صورك وفيديوهاتك لهنا</h3><p>حتى 50 MB للملف · حتى 12 ملف للمحتوى</p>
      <input ref={input} aria-label="اختيار ملفات للرفع" type="file" accept={supportedMimes.join(',')} multiple hidden onChange={event => choose(event.target.files)}/>
      <button className="button small secondary" type="button" disabled={running || pending || disabled} onClick={() => input.current?.click()}><Plus size={16}/>اختيار الملفات</button><small>JPG / PNG / WEBP / GIF / MP4 / WEBM</small>
    </div>
    {progress && <div className="upload-progress" aria-live="polite"><div><span>{progress.stage}</span><b>{percent}٪</b></div><p dir="ltr">{progress.name}</p><progress aria-label={`تقدم رفع ${progress.name}`} value={progress.bytes} max={progress.size}/><small>الملف {progress.index} من {progress.total} · <bdi>{formatBytes(progress.bytes)} / {formatBytes(progress.size)}</bdi></small>{progress.note && <small className="compression-result"><bdi>{progress.note}</bdi></small>}</div>}
    {error && <p className="error-message" role="alert">{error}</p>}
    {message && <p className="upload-message" role="status"><Check size={15}/>{message}</p>}
    {pending && <div className="upload-actions">{running ? <button type="button" className="button small secondary" onClick={() => controller.current?.abort()}><Pause size={15}/>إيقاف مؤقت</button> : <><button type="button" className="button small" disabled={disabled} onClick={() => void run()}><RotateCcw size={15}/>{jobs.current.some(job => job.transferred && !job.done) ? 'إعادة تأكيد الملف' : 'إعادة المحاولة'}</button><button type="button" className="text-button" onClick={() => { jobs.current = []; setPending(false); setProgress(null); setError(''); setMessage('اختر ملفات أخرى أو أضف رابط الفيديو الطويل.'); if (input.current) input.current.value = ''; }}>اختيار ملفات أخرى</button></>}</div>}
    {running && <p className="upload-help"><Loader2 className="spin" size={13}/>خلي الصفحة مفتوحة؛ نحاول نكمل تلقائياً إذا انقطع الاتصال.</p>}
  </section>;
}
