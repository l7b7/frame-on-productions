'use client';
import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import type { AdminSession } from '@/lib/runtime';
import Brand from './Brand';

export default function AdminAccess({ session, busy, error, onLogin }: {
  session: AdminSession | null;
  busy: boolean;
  error: string;
  onLogin: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  return <main className="admin-access" dir="rtl">
    <aside className="admin-access-scene">
      <img className="admin-access-image" src="/intro-lens.png" alt="" width="1672" height="941" />
      <Brand />
      <div className="admin-access-story"><span className="eyebrow" dir="ltr">BEHIND EVERY GREAT FRAME.</span><h2>مكانك<br />خلف المشهد<span>.</span></h2><p>أعمالك، فريقك، وكل التفاصيل.<br />مساحة واحدة حتى تصنع الحكاية الجاية.</p></div>
      <span className="admin-access-stamp mono" dir="ltr">FRAME ON PRODUCTIONS / STUDIO CONTROL</span>
    </aside>
    <section className="admin-access-panel" aria-labelledby="admin-access-title">
      <a className="admin-access-return" href="/ar"><ArrowRight size={16} />العودة للموقع</a>
      <div className="admin-access-content">
        <div className="auth-icon"><LockKeyhole size={24} /></div>
        <span className="eyebrow" dir="ltr">YOUR CREATIVE WORKSPACE</span>
        <h1 id="admin-access-title">أهلاً بيك في الاستوديو.</h1>
        <p>{session?.authenticated ? 'هذا الحساب ما عنده صلاحية إدارة الموقع. تواصل ويا مسؤول الموقع أو ادخل بحساب مخوّل.' : 'سجّل دخولك بحساب الإدارة حتى ترفع أعمالك وتدير محتوى الموقع.'}</p>
        {session?.mode === 'sites' ? <a className="button full" href={session.authenticated ? session.signOutUrl : session.signInUrl} target="_top"><LockKeyhole size={16} />{session.authenticated ? 'تبديل الحساب' : 'دخول الإدارة الآمن'}</a> : <form onSubmit={onLogin}>
          <label htmlFor="admin-email">البريد الإلكتروني<input id="admin-email" required type="email" name="email" autoComplete="username" autoCapitalize="none" spellCheck={false} dir="ltr" placeholder="you@company.com" disabled={busy} /></label>
          <label htmlFor="admin-password">كلمة المرور<span className="admin-password-field"><input id="admin-password" required type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" maxLength={256} dir="ltr" disabled={busy} /><button type="button" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} aria-pressed={showPassword} aria-controls="admin-password" onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
          {error && <p className="error-message" role="alert">{error}</p>}
          <button type="submit" className="button full" disabled={busy}>{busy ? <Loader2 className="spin" size={17} /> : <LockKeyhole size={17} />}{busy ? 'جارٍ تسجيل الدخول…' : 'دخول الاستوديو'}</button>
          {session?.configured === false && <p className="admin-access-note" role="status">الاتصال بخدمة الدخول غير مكتمل بهالنسخة المنشورة. تگدر تجرب الدخول حتى تظهر رسالة توضح الإعداد المطلوب.</p>}
        </form>}
        <div className="admin-access-security"><ShieldCheck size={16} /><span>مساحة خاصة للفريق المخوّل فقط.</span></div>
      </div>
      <footer className="admin-access-footer mono" dir="ltr">© {new Date().getFullYear()} FRAME ON PRODUCTIONS</footer>
    </section>
  </main>;
}
