'use client';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import MotionScene, { MotionToggle, useSceneMotion } from './MotionScene';
import { BrandSymbol } from './Brand';

export default function Welcome() {
  const motion = useSceneMotion();
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function enter(event: MouseEvent<HTMLAnchorElement>, language: 'ar' | 'en') {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || motion.reduced || motion.paused) return;
    event.preventDefault(); if (leaving) return;
    setLeaving(true); timer.current = setTimeout(() => window.location.assign(`/${language}`), 240);
  }
  return <main className={`welcome welcome-v2 welcome-v3 ${motion.paused ? 'motion-paused' : ''} ${leaving ? 'is-leaving' : ''}`} dir="ltr">
    <MotionScene paused={motion.paused} variant="intro" />
    <div className="welcome-viewfinder" aria-hidden="true"><i /><i /><i /><i /><span className="viewfinder-label mono">F / O — OPENING SCENE</span></div>
    <div className="welcome-top mono"><span><i className="rec-dot" /> FRAME ON PRODUCTIONS</span><span>CREATIVE VISION DIGITAL CRAFT</span></div>
    <section className="welcome-content">
      <span className="welcome-scene-number mono">[ F / O ] &nbsp; A NEW SCENE STARTS HERE</span>
      <h1 className="welcome-brand"><span className="welcome-emblem" aria-hidden="true"><BrandSymbol /></span><span className="welcome-wordmark" aria-hidden="true">FRAME <b>ON</b></span><span className="welcome-production" aria-hidden="true">PRODUCTIONS</span><span className="sr-only">FRAME ON PRODUCTIONS</span></h1>
      <p className="welcome-tagline" dir="rtl">إنت تتخيّل… وإحنا نصنع المشهد</p>
      <p className="welcome-subline" lang="ar" dir="rtl">إنتاج إعلامي · أفكار إبداعية · تجارب رقمية</p>
      <div className="language-intro"><span lang="ar" dir="rtl">اختار لغتك، وخلّي الحكاية تبدأ</span><span className="mono">CHOOSE YOUR LANGUAGE</span></div>
      <nav className="language-choices-v2" aria-label="اختيار اللغة / Choose your language">
        <a href="/ar" lang="ar" dir="rtl" onClick={event => enter(event, 'ar')}><span>العربية</span><ArrowUpLeft size={21} /></a>
        <span className="language-divider" aria-hidden="true" />
        <a href="/en" lang="en" dir="ltr" onClick={event => enter(event, 'en')}><span>English</span><ArrowUpRight size={21} /></a>
      </nav>
    </section>
    <footer className="welcome-bottom"><span className="mono">EVERY FRAME TELLS A STORY</span><MotionToggle paused={motion.paused} reduced={motion.reduced} onToggle={motion.toggle} ar /><span className="mono">© {new Date().getFullYear()} FRAME ON</span></footer>
  </main>;
}
