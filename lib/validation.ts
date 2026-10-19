import { z } from 'zod';
import { categories, videoEmbed } from './content';
export const supportedMimes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
export const MAX_MEDIA_BYTES = 30 * 1024 * 1024;
export const mediaSchema = z.object({ key: z.string().regex(/^media\/[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$/), name: z.string().trim().min(1).max(180), mime: z.string().refine(v => supportedMimes.includes(v)), size: z.number().int().positive().max(MAX_MEDIA_BYTES) });
export const entrySchema = z.object({
  kind: z.enum(['project', 'team']), category: z.string().refine(v => categories.some(c => c.id === v)),
  titleAr: z.string().trim().min(1).max(180), titleEn: z.string().trim().min(1).max(180),
  descriptionAr: z.string().trim().max(6000).default(''), descriptionEn: z.string().trim().max(6000).default(''),
  media: z.array(mediaSchema).max(12).default([]), videoUrl: z.string().max(300).refine(v => !v || !!videoEmbed(v), 'Use a valid HTTPS YouTube or Vimeo URL.').default(''), featured: z.boolean().default(false), published: z.boolean().default(false),
}).superRefine((value, ctx) => { if (value.kind === 'project' && value.published && value.media.length === 0 && !value.videoUrl) ctx.addIssue({code: 'custom', path: ['media'], message: 'أضف صورة أو فيديو قبل نشر العمل.'}); });
const hosts: Record<string, string[]> = { tiktok: ['tiktok.com', 'www.tiktok.com'], snapchat: ['snapchat.com', 'www.snapchat.com'], facebook: ['facebook.com', 'www.facebook.com', 'fb.com'], telegram: ['t.me'], instagram: ['instagram.com', 'www.instagram.com'], youtube: ['youtube.com', 'www.youtube.com', 'youtu.be'], whatsapp: ['wa.me', 'api.whatsapp.com'] };
const social = (key: string) => z.string().max(1500).refine(v => { if (!v) return true; try { const u = new URL(v); return u.protocol === 'https:' && hosts[key].includes(u.hostname.toLowerCase()) && !u.username && !u.password; } catch { return false; } }, 'أدخل رابط HTTPS صحيح للمنصة.');
export const settingsSchema = z.object({ aboutAr: z.string().trim().min(1).max(4000), aboutEn: z.string().trim().min(1).max(4000), socials: z.object({ tiktok: social('tiktok'), snapchat: social('snapchat'), facebook: social('facebook'), telegram: social('telegram'), instagram: social('instagram'), youtube: social('youtube'), whatsapp: social('whatsapp') }) });
export function extension(mime: string) { return ({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm'} as Record<string,string>)[mime]; }
export function validSignature(bytes: Uint8Array, mime: string): boolean {
  const a = (s: string, offset = 0) => [...s].every((c,i) => bytes[offset+i] === c.charCodeAt(0));
  if (bytes.length < 12) return false;
  if (mime === 'image/jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (mime === 'image/png') return bytes[0] === 137 && a('PNG\r\n\x1a\n',1);
  if (mime === 'image/webp') return a('RIFF') && a('WEBP',8);
  if (mime === 'video/mp4') return a('ftyp',4);
  if (mime === 'video/webm') return bytes[0] === 26 && bytes[1] === 69 && bytes[2] === 223 && bytes[3] === 163;
  return false;
}
