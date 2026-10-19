'use client';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUpLeft, ArrowUpRight, ChevronDown } from 'lucide-react';
import { categories, type Lang } from '@/lib/content';

export default function ServicesMenu({ lang, onSelect }: { lang: Lang; onSelect: (id: string) => void }) {
  const ar = lang === 'ar';
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pointerIntent = useRef(false);
  const lastPointer = useRef('');
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);
  function focusItem(index: number) {
    requestAnimationFrame(() => {
      const items = container.current?.querySelectorAll<HTMLButtonElement>('[data-service-choice]');
      if (items?.length) items[(index + items.length) % items.length]?.focus();
    });
  }
  function keys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation(); trigger.current?.focus(); setOpen(false); return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); setOpen(true);
    const items = Array.from(container.current?.querySelectorAll<HTMLButtonElement>('[data-service-choice]') || []);
    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Home') focusItem(0);
    else if (event.key === 'End') focusItem(categories.length - 1);
    else if (event.key === 'ArrowDown') focusItem(current + 1);
    else focusItem(current < 0 ? categories.length - 1 : current - 1);
  }
  return <div ref={container} className={`services-nav ${open ? 'is-open' : ''}`}
    onPointerEnter={event => { if (event.pointerType === 'mouse' && window.matchMedia('(hover: hover)').matches) setOpen(true); }}
    onPointerLeave={event => { if (event.pointerType === 'mouse' && (document.activeElement === trigger.current || !container.current?.contains(document.activeElement))) setOpen(false); }}
    onFocus={event => { if (!pointerIntent.current && !event.currentTarget.contains(event.relatedTarget as Node)) setOpen(true); }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}
    onKeyDown={keys}>
    <button ref={trigger} type="button" aria-expanded={open} aria-controls="services-panel"
      onPointerDown={event => { pointerIntent.current = true; lastPointer.current = event.pointerType; }}
      onPointerUp={() => { requestAnimationFrame(() => { pointerIntent.current = false; }); }}
      onClick={event => {
        const finePointer = event.detail > 0 && lastPointer.current === 'mouse' && window.matchMedia('(hover: hover)').matches;
        setOpen(value => finePointer ? true : !value); pointerIntent.current = false;
      }}>
      {ar ? 'أقسامنا' : 'What we do'}<ChevronDown size={13} />
    </button>
    {open && <div id="services-panel" className="services-dropdown" aria-label={ar ? 'أقسام فريم أون' : 'Frame On services'}>
      <span className="dropdown-label mono">EXPLORE THE STUDIO</span>
      {categories.map((category, index) => <button type="button" key={category.id} data-service-choice onClick={() => { setOpen(false); onSelect(category.id); }}>
        <span className="dropdown-number mono">{String(index + 1).padStart(2, '0')}</span><span>{ar ? category.ar : category.en}</span>{ar ? <ArrowUpLeft size={14} /> : <ArrowUpRight size={14} />}
      </button>)}
    </div>}
  </div>;
}
