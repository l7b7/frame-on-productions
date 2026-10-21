'use client';
import { ImagePlus, X } from 'lucide-react';
import { entryThumbnail, mediaUrl, type Media } from '@/lib/content';
import MediaUploader from './MediaUploader';

type Props = {
  media: Media[];
  disabled: boolean;
  onUploaded: (media: Media) => void;
  onRemove: () => void;
  onBusyChange: (busy: boolean) => void;
  onStart: () => void;
};

export default function VideoThumbnailField({ media, disabled, onUploaded, onRemove, onBusyChange, onStart }: Props) {
  const custom = media.find(item => item.role === 'thumbnail');
  const cover = entryThumbnail({ media });
  return <section className="video-thumbnail-field" aria-labelledby="video-thumbnail-heading">
    <h3 id="video-thumbnail-heading"><ImagePlus size={21}/>غلاف الفيديو <span>اختياري</span></h3>
    <p>اختَر الصورة اللي يشوفها الزائر قبل تشغيل الفيديو تظهر للأعمال والفيديوهات الطويلة برابط أيضاً</p>
    {cover && <figure className="thumbnail-preview"><img src={mediaUrl(cover)} alt="معاينة غلاف الفيديو"/><figcaption>{custom ? 'غلاف مخصص للفيديو' : 'الغلاف الحالي من صور المحتوى'}</figcaption></figure>}
    <MediaUploader variant="thumbnail" count={media.length - (custom ? 1 : 0)} disabled={disabled} onUploaded={onUploaded} onBusyChange={onBusyChange} onStart={onStart}/>
    {custom && <button type="button" className="text-button thumbnail-remove" disabled={disabled} onClick={onRemove}><X size={16}/>إزالة الغلاف المخصص</button>}
    <small>إذا ما تختار غلاف نستخدم صورة من صور المحتوى الغلاف ينحفظ ويا المحتوى عند الضغط على الحفظ</small>
  </section>;
}
