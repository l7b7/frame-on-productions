'use client';
import { useState } from 'react';
import { ArrowUpLeft, ArrowUpRight, FileText, Film } from 'lucide-react';
import { postCategories, textOf, mediaUrl, entryThumbnail, type Entry, type Lang } from '@/lib/content';
import { displayText } from '@/lib/display-text';

export default function Updates({ entries, lang, onOpen, onStudioHeart }: { entries: Entry[]; lang: Lang; onOpen: (entry: Entry) => void; onStudioHeart?: () => void }) {
  const [filter, setFilter] = useState('all');
  const ar = lang === 'ar';
  const t = (arabic: string, english: string) => displayText(ar ? arabic : english);
  const posts = entries.filter(entry => entry.kind === 'post' && entry.published);
  const shown = filter === 'all' ? posts : posts.filter(entry => entry.category === filter);
  const formatter = new Intl.DateTimeFormat(ar ? 'ar-IQ' : 'en-GB', { day:'numeric', month:'short', year:'numeric', timeZone:'Asia/Baghdad' });
  return <section className="section updates-section" id="updates" aria-labelledby="updates-title">
    <div className="section-label mono" dir="ltr"><span className="rec-dot" />07 / STUDIO JOURNAL</div>
    <div className="section-heading"><h2 id="updates-title"><a className="button studio-journal-link" href="#studio-heart" onClick={onStudioHeart}>{t('من قلب الاستوديو','From inside the studio')}{ar ? <ArrowUpLeft size={24}/> : <ArrowUpRight size={24}/>}</a></h2></div>
    {posts.length ? <>
      <div className="work-filters" role="group" aria-label={t('تصفية الأخبار والمقالات','Filter studio updates')}>
        <button type="button" className={filter === 'all' ? 'selected' : ''} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>{t('كل الجديد','All updates')}</button>
        {postCategories.map(category => <button key={category.id} type="button" className={filter === category.id ? 'selected' : ''} aria-pressed={filter === category.id} onClick={() => setFilter(category.id)}>{category[lang]}</button>)}
      </div>
      {shown.length ? <div className="updates-grid">{shown.map(entry => <article className="update-card" key={entry.id}>
        <button type="button" onClick={() => onOpen(entry)} aria-label={`${t('اقرأ','Read')} ${textOf(entry,'title',lang)}`}>
          {entryThumbnail(entry) ? <div className="update-cover"><img src={mediaUrl(entryThumbnail(entry)!)} alt="" loading="lazy" /></div> : <div className="update-cover update-cover-type" aria-hidden="true">{entry.videoUrl || entry.media.some(media => media.mime.startsWith('video/')) ? <Film size={35} /> : <FileText size={35} />}<span className="mono">FRAME ON / JOURNAL</span></div>}
          <div className="update-copy"><div className="update-meta"><span>{postCategories.find(category => category.id === entry.category)?.[lang]}</span><time dateTime={entry.createdAt}>{formatter.format(new Date(entry.createdAt))}</time></div><h3>{textOf(entry,'title',lang)}</h3><p>{textOf(entry,'description',lang)}</p><span className="update-read">{t('اقرأ الحكاية','Read the story')}{ar ? <ArrowUpLeft size={17} /> : <ArrowUpRight size={17} />}</span></div>
        </button>
      </article>)}</div> : <p className="updates-empty" role="status">{t("بعد ما نشرنا محتوى بهذا التصنيف","There are no published updates in this category yet")}</p>}
    </> : null}
  </section>;
}
