import type { Settings } from '@/lib/content';
const platforms = [
  ['facebook', 'Facebook'], ['snapchat', 'Snapchat'], ['telegram', 'Telegram'],
  ['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['youtube', 'YouTube'], ['whatsapp', 'WhatsApp'],
] as const;
export default function SocialLinks({ socials, ar, id }: { socials: Settings['socials']; ar: boolean; id?: string }) {
  return <nav className="social-icons" id={id} aria-label={ar ? 'حسابات فريم أون على مواقع التواصل' : 'Frame On social accounts'} dir="ltr">
    {platforms.map(([key, name], index) => {
      const url = socials[key];
      if (!url && index >= 5) return null;
      const icon = <img src={`/social/${key}.svg`} width="23" height="23" alt=""/>;
      return url ? <a key={key} className={`social-icon social-${key}`} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} — ${ar ? 'حساب فريم أون' : 'Frame On account'}`} title={name}>{icon}</a>
        : <span key={key} className="social-icon social-unavailable" role="img" aria-label={`${name} — ${ar ? 'رابط الحساب غير مضاف بعد' : 'Account link not added yet'}`} title={ar ? `رابط ${name} يُضاف من لوحة الإدارة` : `Add the ${name} URL in the admin settings`}>{icon}</span>;
    })}
  </nav>;
}
