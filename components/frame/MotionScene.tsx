'use client';
import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

export function useSceneMotion() {
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      let saved = false;
      try { saved = localStorage.getItem('frame-on-motion') === 'paused'; } catch { /* optional preference */ }
      setReduced(preference.matches); setPaused(preference.matches || saved);
    };
    sync(); preference.addEventListener('change', sync);
    return () => preference.removeEventListener('change', sync);
  }, []);
  function toggle() {
    if (reduced) return;
    setPaused(current => {
      const next = !current;
      try { localStorage.setItem('frame-on-motion', next ? 'paused' : 'running'); } catch { /* optional preference */ }
      return next;
    });
  }
  return { paused, reduced, toggle };
}

export function MotionToggle({ paused, reduced, onToggle, ar = false }: { paused: boolean; reduced: boolean; onToggle: () => void; ar?: boolean }) {
  const label = reduced ? (ar ? 'الحركة متوقفة' : 'Motion reduced') : paused ? (ar ? 'تشغيل الحركة' : 'Play motion') : (ar ? 'إيقاف الحركة' : 'Pause motion');
  return <button type="button" className="motion-toggle" onClick={onToggle} aria-pressed={paused} disabled={reduced} title={reduced ? (ar ? 'حسب تفضيل تقليل الحركة بجهازك' : 'Your device prefers reduced motion') : label}>
    {paused ? <Play size={12} /> : <Pause size={12} />}<span>{label}</span>
  </button>;
}

export default function MotionScene({ paused, variant, flipped = false }: { paused: boolean; variant: 'intro' | 'hero'; flipped?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [suspended, setSuspended] = useState(false);
  useEffect(() => {
    let inView = true;
    const sync = () => setSuspended(document.hidden || !inView);
    const observer = new IntersectionObserver(entries => { inView = !!entries[0]?.isIntersecting; sync(); }, { threshold: 0 });
    if (ref.current) observer.observe(ref.current);
    document.addEventListener('visibilitychange', sync); sync();
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);
  return <div ref={ref} className={`cinematic-scene scene-${variant} ${paused || suspended ? 'scene-paused' : ''}`} data-flipped={flipped || undefined} aria-hidden="true">
    <div className="cinema-frame"><img src={variant === 'intro' ? '/intro-lens.png' : '/hero-cinema.png'} alt="" width={variant === 'intro' ? 1672 : 1774} height={variant === 'intro' ? 941 : 887} fetchPriority="high" decoding="async" /></div>
    <div className="cinema-light" />
    <div className="cinema-haze haze-near" />
    <div className="cinema-haze haze-far" />
    {variant === 'intro' && <><div className="lens-reflection" /><div className="lens-focus-ring" /></>}
    <div className="cinema-vignette" />
    <div className="cinema-texture" />
  </div>;
}
