export type ImageQuality = 'original' | 'balanced' | 'small';
export const formatBytes = (size: number) => size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} KB` : `${(size / 1024 / 1024).toFixed(1)} MB`;

// APNG, GIF and WebP must retain their animation. Only static PNG/JPEG are recompressed.
export async function isAnimatedPng(file: Blob): Promise<boolean> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer);
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
    if (type === 'acTL') return true;
    if (type === 'IDAT' || type === 'IEND') return false;
    if (length > bytes.length - offset - 12) return true; // Preserve an uncertain file.
    offset += length + 12;
  }
  return true;
}

export async function prepareImage(file: File, quality: ImageQuality, purpose: 'media' | 'thumbnail' = 'media'): Promise<{ file: File; note: string }> {
  // Covers must retain the selected bytes. Canvas/WebP conversion can produce
  // corrupted colors with some graphics drivers or canvas-protection extensions.
  if (purpose === 'thumbnail') return { file, note: 'حافظنا على صورة الغلاف الأصلية بنفس الصيغة والألوان' };
  if (quality === 'original' || !['image/jpeg', 'image/png'].includes(file.type)) return { file, note: '' };
  if (file.type === 'image/png' && await isAnimatedPng(file)) return { file, note: 'حافظنا على حركة الصورة بدون ضغط.' };
  const source = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    if (!image.naturalWidth || image.naturalWidth * image.naturalHeight > 40000000) return { file, note: 'الصورة كبيرة الأبعاد؛ احتفظنا بالأصل.' };
    const edge = quality === 'small' ? 1600 : 2560;
    const scale = Math.min(1, edge / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) return { file, note: 'الضغط غير متاح بهذا المتصفح؛ نرفع الأصل.' };
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality === 'small' ? 0.72 : 0.88));
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return { file, note: 'حجم الأصل مناسب؛ ما احتجنا نضغطه.' };
    const result = new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: blob.type, lastModified: file.lastModified });
    return { file: result, note: `${formatBytes(file.size)} ← ${formatBytes(result.size)} · وفرنا ${Math.round((1 - result.size / file.size) * 100)}٪` };
  } catch {
    return { file, note: 'تعذّر ضغط الصورة؛ نرفع الأصل مع الحفاظ على جودته.' };
  } finally { URL.revokeObjectURL(source); }
}
