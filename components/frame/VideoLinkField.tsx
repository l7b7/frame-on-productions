'use client';
import { useState } from 'react';
import { Film } from 'lucide-react';
import { videoEmbed } from '@/lib/content';
type Props = { value: string; disabled: boolean; onChange: (value: string) => void };
export default function VideoLinkField({ value, disabled, onChange }: Props) {
  const [preview, setPreview] = useState(false);
  const embed = videoEmbed(value);
  return <details className="video-link-panel" open={!!value || undefined}>
    <summary><Film size={18}/>فيديو طويل برابط<span>للفيديوهات الأكبر من 50 MB</span></summary>
    <div><p>لفيلم أو حلقة طويلة: ارفعها على YouTube أو Vimeo، فعّل السماح بالتضمين، وانسخ رابط المشاهدة هنا. تظهر للزائر داخل الموقع.</p>
      <p>على YouTube تگدر تختار «غير مُدرج» حتى ما يظهر بالبحث؛ أي شخص عنده الرابط يگدر يشوفه.</p>
      <label>رابط الفيديو الطويل (اختياري)<input type="url" dir="ltr" maxLength={300} value={value} disabled={disabled} aria-invalid={!!value && !embed} placeholder="https://www.youtube.com/watch?v=…" onChange={event => { onChange(event.target.value.trim()); setPreview(false); }}/></label>
      {value && !embed && <p role="alert" className="video-link-error">أدخل رابط مشاهدة HTTPS صحيح من YouTube أو Vimeo.</p>}
      {embed && <><button type="button" className="text-button" onClick={() => setPreview(!preview)}>{preview ? 'إخفاء المعاينة' : 'معاينة الفيديو'}</button>{preview && <iframe title="معاينة الفيديو الطويل" src={embed} allow="fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation"/>}<small>أضف عنواناً وغلافاً إذا تحب، ثم احفظ المسودة أو فعّل النشر.</small></>}
    </div>
  </details>;
}
