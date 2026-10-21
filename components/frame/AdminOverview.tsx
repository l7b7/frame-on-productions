import { Clapperboard, FileStack, Image, MonitorPlay, Radio, SquarePen } from 'lucide-react';
import type { Entry } from '@/lib/content';

export type LibraryFilter = 'all' | 'published' | 'draft' | 'media';
export default function AdminOverview({ entries, team, filter, onFilter }: {
  entries: Entry[]; team: boolean; filter: LibraryFilter; onFilter: (filter: LibraryFilter) => void;
}) {
  const published = entries.filter(entry => entry.published).length;
  const drafts = entries.length - published;
  const mediaCount = entries.reduce((count, entry) => count + entry.media.filter(media => media.mime.startsWith(team ? 'image/' : 'video/')).length + (!team && entry.videoUrl ? 1 : 0), 0);
  const stats = [
    { id: 'all', label: 'كل المحتوى', value: entries.length, icon: FileStack, tone: 'cyan', hint: 'المكتبة كاملة' },
    { id: 'published', label: 'منشور بالموقع', value: published, icon: Radio, tone: 'green', hint: 'متاح للزوار' },
    { id: 'draft', label: 'مسودات', value: drafts, icon: SquarePen, tone: 'gold', hint: 'مساحتك قبل النشر' },
    { id: 'media', label: team ? 'صور الفريق' : 'فيديوهات المكتبة', value: mediaCount, icon: team ? Image : MonitorPlay, tone: 'red', hint: team ? 'عرض المحتوى المصوّر' : 'ملفات الفيديو والروابط' },
  ] as const;
  return <section className="admin-overview" aria-label="إحصائيات المكتبة">
    <div className="admin-overview-label"><span><Clapperboard size={17}/>نظرة على مكتبتك</span><small className="mono" dir="ltr">CONTENT / OVERVIEW</small></div>
    <div className="admin-stats">{stats.map(stat => <button type="button" className={`admin-stat stat-${stat.tone}`} key={stat.id} aria-pressed={filter === stat.id} onClick={() => onFilter(stat.id)}>
      <span className="stat-top"><span>{stat.label}</span><stat.icon size={20}/></span><b>{stat.value.toLocaleString('en-US')}</b><span className="stat-bottom">{stat.hint}<span aria-hidden="true">↙</span></span>
    </button>)}</div>
    <div className="admin-publication"><span>حالة النشر</span><div className="publication-track" role="img" aria-label={`${published} منشور و${drafts} مسودة`}><i style={{width: `${entries.length ? published / entries.length * 100 : 0}%`}}/><i style={{width: `${entries.length ? drafts / entries.length * 100 : 0}%`}}/></div><span>{entries.length ? `${published} منشور / ${drafts} مسودة` : 'بانتظار أول مشهد'}</span></div>
  </section>;
}
