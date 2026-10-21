'use client';
import { displayText } from '@/lib/display-text';
import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Upload, Save, Trash2, X, Image as ImageIcon, Film, LayoutGrid, Users, Settings as SettingsIcon, ExternalLink, LogOut, Check, Pencil, Eye, EyeOff, Loader2, ShieldCheck, Newspaper, Clapperboard, ScanLine, Search, CircleDot, Type, Radio, ArrowUpLeft } from 'lucide-react';
import { categories, postCategories, defaultSettings, type Entry, type Settings, mediaUrl, entryThumbnail, withThumbnail } from '@/lib/content';
import type { AdminSession } from '@/lib/runtime';
import Brand from './Brand';
import AdminAccess from './AdminAccess';
import { adminRequest as request, asJson } from '@/lib/admin-request';
import MediaUploader from './MediaUploader';
import VideoLinkField from './VideoLinkField';
import VideoThumbnailField from './VideoThumbnailField';
import AdminStudioMark from './AdminStudioMark';
import AdminOverview, { type LibraryFilter } from './AdminOverview';
type Draft = Omit<Entry,'id'|'createdAt'|'updatedAt'> & {id?:string};
const newDraft = (kind:Entry['kind']):Draft => ({kind,category:kind==='post'?'news':'advertising',titleAr:'',titleEn:'',descriptionAr:'',descriptionEn:'',media:[],videoUrl:'',featured:false,published:false});
const authRequest = <T,>(path:string, options:RequestInit={}) => request<T>(path,options,20000);
export default function Admin(){
  const [session,setSession]=useState<AdminSession|null>(null);const [initialError,setInitialError]=useState('');const [loaded,setLoaded]=useState(false);
  const [entries,setEntries]=useState<Entry[]>([]);const [settings,setSettings]=useState<Settings>(structuredClone(defaultSettings));
  const [tab,setTab]=useState<Entry['kind']|'settings'>('project');const [editor,setEditor]=useState<Draft|null>(null);
  const [busy,setBusy]=useState(false);const [uploading,setUploading]=useState(false);const [error,setError]=useState('');const [success,setSuccess]=useState('');
  const [visibility,setVisibility]=useState<LibraryFilter>('all');
  const [dirty,setDirty]=useState(false);const [search,setSearch]=useState('');const [loginError,setLoginError]=useState('');
  useEffect(()=>{document.documentElement.lang='ar';document.documentElement.dir='rtl';let alive=true;(async()=>{try{const s=await authRequest<AdminSession>('/api/admin/session');if(!alive)return;setSession(s);if(s.authorized&&s.configured){const [a,b]=await Promise.all([request<{entries:Entry[]}>('/api/admin/entries'),request<{settings:Settings}>('/api/admin/settings')]);if(alive){setEntries(a.entries);setSettings(b.settings);}}}catch(e){if(alive)setInitialError((e as Error).message);}finally{if(alive)setLoaded(true);}})();return()=>{alive=false;};},[]);
  useEffect(()=>{const handler=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler);},[dirty]);
  useEffect(()=>{if(!success)return;const id=setTimeout(()=>setSuccess(''),6000);return()=>clearTimeout(id);},[success]);
  function openEditor(value:Draft|null){if(uploading||busy)return;if(dirty&&!window.confirm("عندك تغييرات غير محفوظة تريد تتركها؟"))return;setEditor(value);setDirty(false);setError('');}
  function change<K extends keyof Draft>(key:K,value:Draft[K]){setEditor(old=>old?{...old,[key]:value}:old);setDirty(true);}
  async function login(event:FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;const f=new FormData(event.currentTarget);setBusy(true);setLoginError('');try{await authRequest('/api/auth/login',asJson('POST',{email:String(f.get('email')||'').trim(),password:f.get('password')}));window.location.reload();}catch(e){setLoginError((e as Error).message);}finally{setBusy(false);}}
  async function save(event:FormEvent){event.preventDefault();if(!editor||busy||uploading)return;setBusy(true);setError('');try{const value=await request<{entry:Entry}>(editor.id?`/api/admin/entries/${editor.id}`:'/api/admin/entries',asJson(editor.id?'PUT':'POST',editor));setEntries(old=>[value.entry,...old.filter(e=>e.id!==value.entry.id)]);setEditor(null);setDirty(false);setSuccess(value.entry.published?"انحفظ واننشر المحتوى بالموقع":"انحفظت المسودة ما تظهر للزوار");}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  async function remove(entry:Entry){if(!window.confirm(`متأكد تريد تحذف «${entry.titleAr}»؟`))return;setBusy(true);setError('');try{await request(`/api/admin/entries/${entry.id}`,{method:'DELETE'});setEntries(old=>old.filter(e=>e.id!==entry.id));setSuccess("انحذف المحتوى");}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  async function toggle(entry:Entry){setBusy(true);setError('');try{const data=await request<{entry:Entry}>(`/api/admin/entries/${entry.id}`,asJson('PUT',{...entry,published:!entry.published}));setEntries(old=>old.map(e=>e.id===entry.id?data.entry:e));setSuccess(data.entry.published?"اننشر المحتوى":"رجع المحتوى مسودة");}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  async function saveSettings(event:FormEvent){event.preventDefault();setBusy(true);setError('');try{const data=await request<{settings:Settings}>('/api/admin/settings',asJson('PUT',settings));setSettings(data.settings);setDirty(false);setSuccess("انحفظت النصوص وروابط التواصل");}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  function switchTab(value:typeof tab){if(uploading||busy)return;if(dirty&&!window.confirm("عندك تغييرات غير محفوظة تريد تتركها؟"))return;setTab(value);setVisibility('all');setEditor(null);setDirty(false);setError('');setSearch('');}
  if(!loaded)return <main className="admin-loading admin-cyber-loading"><Loader2 className="spin"/><p>نحضّر لوحة الإدارة</p></main>;
  if(initialError&&session?.authorized)return <main className="admin-auth"><img src="/brand-logo-transparent.png" alt="Frame On" width="100" height="100"/><h1>تعذّر تحميل لوحة الإدارة</h1><p role="alert">{displayText(initialError)}</p><button className="button" onClick={()=>window.location.reload()}>إعادة المحاولة</button><a href="/ar">العودة للموقع</a></main>;
  if(!session?.authorized)return <AdminAccess session={session} busy={busy} error={loginError||initialError} onLogin={login}/>;
  const scoped=entries.filter(entry=>entry.kind===tab);
  const listed=scoped.filter(entry=>(!search||`${entry.titleAr} ${entry.titleEn}`.toLowerCase().includes(search.toLowerCase()))&&(
    visibility==='all'||visibility==='published'&&entry.published||visibility==='draft'&&!entry.published||visibility==='media'&&(entry.media.some(media=>media.mime.startsWith(tab==='team'?'image/':'video/'))||tab!=='team'&&!!entry.videoUrl)
  ));
  const sectionName=tab==='settings'?'النصوص والتواصل':tab==='team'?'الإدارة والفريق':tab==='post'?'الأخبار والمقالات':'الأعمال والمحتوى';
  const filtered=!!search||visibility!=='all';
  return <div className="admin-shell admin-cyber" dir="rtl">
    <a className="admin-skip" href="#admin-main">انتقل لمساحة العمل</a>
    <aside className="admin-sidebar">
      <Brand href="/ar"/>
      <div className="admin-sidebar-identity"><AdminStudioMark/><span className="mono" dir="ltr">CREATIVE<br/><b>CONTROL ROOM</b></span></div>
      <span className="admin-sidebar-label">مساحة الإدارة <span className="mono">01 — 04</span></span>
      <nav aria-label="أقسام لوحة الإدارة">
        <button type="button" className={tab==='project'?'active':''} aria-current={tab==='project'?'page':undefined} disabled={uploading||busy} onClick={()=>switchTab('project')}><LayoutGrid size={19}/>الأعمال والمحتوى<span>{entries.filter(e=>e.kind==='project').length}</span></button>
        <button type="button" className={tab==='post'?'active':''} aria-current={tab==='post'?'page':undefined} disabled={uploading||busy} onClick={()=>switchTab('post')}><Newspaper size={19}/>الأخبار والمقالات</button>
        <button type="button" className={tab==='team'?'active':''} aria-current={tab==='team'?'page':undefined} disabled={uploading||busy} onClick={()=>switchTab('team')}><Users size={19}/>الإدارة والفريق</button>
        <button type="button" className={tab==='settings'?'active':''} aria-current={tab==='settings'?'page':undefined} disabled={uploading||busy} onClick={()=>switchTab('settings')}><SettingsIcon size={19}/>النصوص والتواصل</button>
      </nav>
      <div className="admin-sidebar-bottom">
        <div><ShieldCheck size={17}/><span>جلسة إدارة محمية</span><i className="control-dot" aria-hidden="true"/></div>
        <small>{session.name}</small>
        <a href="/ar" target="_blank" rel="noopener noreferrer"><ExternalLink size={17}/>معاينة الموقع</a>
        {session.mode==='sites'?<a href={session.signOutUrl} target="_top"><LogOut size={17}/>تسجيل الخروج</a>:<button type="button" disabled={uploading||busy} onClick={async()=>{await request('/api/auth/logout',{method:'POST'});window.location.reload();}}><LogOut size={17}/>تسجيل الخروج</button>}
      </div>
      <span className="admin-sidebar-signature mono" dir="ltr">FRAME ON / EST. CREATIVE</span>
    </aside>
    <main className="admin-main" id="admin-main">
      <header className="admin-top"><div><ScanLine size={20}/><span>{sectionName}</span><span className="mono" dir="ltr">/ STUDIO CONTROL</span></div><a href="/ar" target="_blank" rel="noopener noreferrer">افتح الموقع<ExternalLink size={16}/></a></header>
      <div className="admin-heading">
        <div className="admin-heading-copy"><span className="eyebrow" dir="ltr"><i className="control-dot"/>FRAME ON / CREATIVE OPERATIONS</span><h1>{tab==='settings'?'صوتك، وهويّتك الرقمية':tab==='team'?'الفريق اللي يصنع المشهد':tab==='post'?'قصصكم تستحق تنحچي':'كل مشهد يبدأ من هنا'}</h1><p>{tab==='settings'?'حدّث التعريف بالشركة وروابط حساباتكم الرسمية':tab==='team'?'عرّف بالفريق اللي وراء الكاميرا، والأفكار، والتفاصيل':tab==='post'?'انشر أخباركم ومقالاتكم وتغطيات الفعاليات، في مساحة واحدة':'صوّر، رتّب، وانشر حكايتك مساحة واحدة تتحكّم بيها بكل أعمالك'}</p>
        {tab!=='settings'&&!editor&&<button type="button" className="button admin-create" onClick={()=>openEditor(newDraft(tab))}><Plus size={19}/>{tab==='team'?'إضافة عضو':tab==='post'?'إضافة منشور':'إضافة عمل جديد'}<ArrowUpLeft size={19}/></button>}
        </div><div className="admin-heading-art" aria-hidden="true"><span className="mono">FO / CREATIVE CORE</span><AdminStudioMark/><span className="mono">VISION · CRAFT · CONTROL</span></div>
      </div>
      {!session.configured&&<p role="alert" className="error-message">خدمات الحفظ غير مربوطة بعد</p>}
      {error&&<div className="error-message" role="alert">{displayText(error)}</div>}
      {success&&<div className="success-message" role="status"><Check size={18}/>{success}</div>}
      {editor?<form className="entry-editor" onSubmit={save}>
        <div className="editor-heading"><div><span className="mono" dir="ltr">CONTENT / COMPOSER</span><h2>{editor.id?'تعديل المحتوى':editor.kind==='team'?'عضو جديد':editor.kind==='post'?'منشور جديد':'عمل جديد'}</h2></div><button className="icon-button" type="button" disabled={uploading||busy} onClick={()=>openEditor(null)} aria-label="إغلاق التحرير"><X/></button></div>
        <div className="editor-columns">
          <div className="editor-story-card"><div className="editor-card-title"><span className="editor-card-icon"><Type size={21}/></span><div><h3>{editor.kind==='team'?'وراء المشهد':'تفاصيل الحكاية'}</h3><p>العنوان والتفاصيل بالعربي والإنكليزي</p></div><span className="mono">01</span></div>
            <div className="editor-fields"><div className="two-fields">
              <label>{editor.kind==='team'?'الاسم بالعربي':'العنوان بالعربي'}<input value={editor.titleAr} required maxLength={180} onChange={e=>change('titleAr',e.target.value)}/></label>
              <label>{editor.kind==='team'?'الاسم بالإنكليزي':'العنوان بالإنكليزي'}<input dir="ltr" value={editor.titleEn} required maxLength={180} onChange={e=>change('titleEn',e.target.value)}/></label>
            </div>
              <label>{editor.kind==='team'?'الدور والنبذة بالعربي':editor.kind==='post'?'نص المنشور بالعربي':'الوصف بالعربي'}<textarea value={editor.descriptionAr} rows={5} maxLength={6000} onChange={e=>change('descriptionAr',e.target.value)}/></label>
              <label>{editor.kind==='team'?'الدور والنبذة بالإنكليزي':editor.kind==='post'?'نص المنشور بالإنكليزي':'الوصف بالإنكليزي'}<textarea dir="ltr" value={editor.descriptionEn} rows={5} maxLength={6000} onChange={e=>change('descriptionEn',e.target.value)}/></label>
              {editor.kind!=='team'&&<label>{editor.kind==='post'?'نوع المنشور':'القسم'}<select value={editor.category} onChange={e=>change('category',e.target.value)}>{(editor.kind==='post'?postCategories:categories).map(c=><option key={c.id} value={c.id}>{c.ar}</option>)}</select></label>}
            </div>
            <div className="editor-publish-panel"><h3><Radio size={18}/>جاهز للمشهد؟</h3>
              <label className="check-label"><input type="checkbox" checked={editor.featured} onChange={e=>change('featured',e.target.checked)}/><span>محتوى مميز (يظهر بالبداية)</span></label>
              <label className="check-label"><input type="checkbox" checked={editor.published} onChange={e=>change('published',e.target.checked)}/><span>نشر بالموقع {editor.published?<b className="status-badge live">منشور</b>:<b className="status-badge">مسودة</b>}</span></label>
              <p className="editor-note"><ShieldCheck size={15}/>المسودات وملفاتها متاحة للإدارة فقط النصوص تُعرض كنص عادي</p>
            </div>
          </div>
          <div className="editor-media">
            <div className="editor-asset-card"><div className="editor-card-title"><span className="editor-card-icon"><Clapperboard size={22}/></span><div><h3>{editor.kind==='team'?'صورة الفريق':'الصورة والصوت'}</h3><p>{editor.kind==='team'?'ارفع صورة العضو من جهازك':'ارفع صور العمل وفيديوهاته من جهازك'}</p></div><span className="mono">02</span></div>
              <MediaUploader count={editor.media.length} disabled={busy||uploading} onBusyChange={setUploading} onStart={()=>setDirty(true)} onUploaded={media=>{setEditor(old=>old?{...old,media:[...old.media,media]}:old);setDirty(true);}}/>
              {editor.media.some(m=>m.role!=='thumbnail')&&<div className="uploaded-files">{editor.media.filter(m=>m.role!=='thumbnail').map(m=><div className="uploaded-file" key={m.key}>
                {m.mime.startsWith('image/')?<img src={mediaUrl(m)} alt={m.name}/>:<video src={mediaUrl(m)} controls preload="metadata"/>}
                <div><span>{m.name}</span><small>{(m.size/1024/1024).toFixed(1)} MB {entryThumbnail(editor)?.key===m.key?'· الغلاف الحالي':''}</small></div>
                <button type="button" className="icon-button" disabled={busy||uploading} aria-label={`إزالة ${m.name}`} onClick={()=>change('media',editor.media.filter(v=>v.key!==m.key))}><X size={17}/></button>
                {editor.kind!=='team'&&m.mime.startsWith('image/')&&<button type="button" className="cover-button" disabled={busy||uploading} onClick={()=>change('media',withThumbnail(editor.media,m))}>استخدم كغلاف</button>}
              </div>)}</div>}
            </div>
            {editor.kind!=='team'&&<>
              <VideoThumbnailField media={editor.media} disabled={busy||uploading} onBusyChange={setUploading} onStart={()=>setDirty(true)} onUploaded={media=>{setEditor(old=>old?{...old,media:withThumbnail(old.media,media)}:old);setDirty(true);}} onRemove={()=>change('media',editor.media.filter(m=>m.role!=='thumbnail'))}/>
              <VideoLinkField value={editor.videoUrl} disabled={uploading||busy} onChange={value=>change('videoUrl',value)}/>
            </>}
          </div>
        </div>
        <div className="editor-bottom"><span><CircleDot size={15}/>{uploading?'جاري رفع الملفات':dirty?'عندك تغييرات غير محفوظة':'جاهز للتحرير'}</span><div><button type="button" className="button small secondary" disabled={uploading||busy} onClick={()=>openEditor(null)}>إلغاء</button><button className="button small" type="submit" disabled={busy||uploading}>{busy?<Loader2 className="spin" size={18}/>:<Save size={18}/>}حفظ {editor.published?'ونشر':'المسودة'}</button></div></div>
      </form>
      :tab==='settings'?<form className="settings-editor" onSubmit={saveSettings}>
        <div className="editor-card-title"><span className="editor-card-icon"><Type size={22}/></span><div><h2>منو إحنا</h2><p>حكاية الشركة، بصوتكم</p></div></div>
        <div className="two-fields"><label>التعريف بالعربي<textarea value={settings.aboutAr} required rows={7} maxLength={4000} onChange={e=>{setSettings(s=>({...s,aboutAr:e.target.value}));setDirty(true);}}/></label><label>التعريف بالإنكليزي<textarea value={settings.aboutEn} required dir="ltr" rows={7} maxLength={4000} onChange={e=>{setSettings(s=>({...s,aboutEn:e.target.value}));setDirty(true);}}/></label></div>
        <div className="editor-card-title"><span className="editor-card-icon"><ExternalLink size={22}/></span><div><h2>الحسابات الرسمية</h2><p>الحساب اللي ما عنده رابط يبقى مخفي بالموقع</p></div></div>
        <div className="two-fields">{Object.entries(settings.socials).map(([key,value])=><label key={key}>{key.charAt(0).toUpperCase()+key.slice(1)}<input type="url" dir="ltr" value={value} placeholder="https://…" maxLength={1500} onChange={e=>{setSettings(s=>({...s,socials:{...s.socials,[key]:e.target.value}}));setDirty(true);}}/></label>)}</div>
        <button className="button" disabled={busy} type="submit">{busy?<Loader2 className="spin" size={18}/>:<Save size={18}/>}حفظ الإعدادات</button>
      </form>
      :<>
        <AdminOverview entries={scoped} team={tab==='team'} filter={visibility} onFilter={setVisibility}/>
        <div className="admin-library"><div className="admin-list-heading"><div><span className="eyebrow" dir="ltr">YOUR CONTENT, IN FRAME</span><h2>{tab==='team'?'أعضاء الفريق':tab==='post'?'مكتبة الأخبار والمقالات':'مكتبة الأعمال'}<span className="library-count">{listed.length}</span></h2></div><label className="admin-search"><Search size={18}/><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث عن محتوى" aria-label="البحث بالمحتوى"/></label></div>
        {filtered&&<div className="admin-filter-summary"><span>{visibility==='published'?'المحتوى المنشور':visibility==='draft'?'المسودات':visibility==='media'?(tab==='team'?'محتوى بيه صور':'محتوى بيه فيديو'):'نتائج البحث'}{search&&` / ${search}`}</span><button className="text-button" type="button" onClick={()=>{setSearch('');setVisibility('all');}}><X size={14}/>عرض الكل</button></div>}
        {listed.length?<div className="admin-entry-list">{listed.map(entry=><article key={entry.id}>
          <div className="admin-entry-thumb">{entryThumbnail(entry)?<img src={mediaUrl(entryThumbnail(entry)!)} alt=""/>:entry.media.some(m=>m.mime.startsWith('video/'))||entry.videoUrl?<Film size={29}/>:<ImageIcon size={29}/>}</div>
          <div className="admin-entry-text"><span className={`status-badge ${entry.published?'live':''}`}><i aria-hidden="true"/>{entry.published?'منشور':'مسودة'}</span><h3>{displayText(entry.titleAr)}</h3><small>{entry.kind==='project'?categories.find(c=>c.id===entry.category)?.ar:entry.kind==='post'?postCategories.find(c=>c.id===entry.category)?.ar:displayText(entry.descriptionAr.slice(0,80))} · {new Date(entry.createdAt).toLocaleDateString('ar-IQ')}</small></div>
          <div className="admin-entry-actions"><button type="button" className="icon-button" disabled={busy} title={entry.published?'إرجاع لمسودة':'نشر المحتوى'} aria-label={entry.published?'إرجاع لمسودة':'نشر المحتوى'} onClick={()=>void toggle(entry)}>{entry.published?<EyeOff size={19}/>:<Eye size={19}/>}</button><button type="button" className="icon-button" disabled={busy} title="تعديل المحتوى" aria-label="تعديل المحتوى" onClick={()=>openEditor({...entry})}><Pencil size={19}/></button><button type="button" className="icon-button danger" disabled={busy} title="حذف المحتوى" aria-label="حذف المحتوى" onClick={()=>void remove(entry)}><Trash2 size={19}/></button></div>
        </article>)}</div>:<div className="admin-empty"><div><AdminStudioMark/></div><span className="eyebrow" dir="ltr">{filtered?'REFINE YOUR VIEW':'READY FOR THE FIRST TAKE'}</span><h3>{filtered?'ماكو محتوى يطابق هذا العرض':'أول حكاية تبدي من هنا'}</h3><p>{filtered?'غيّر الفلتر أو جرّب اسم ثاني':'مساحتك جاهزة ارفع شغلك، رتّب تفاصيله، وانشره بوقتك'}</p>{!filtered&&<button type="button" className="button" onClick={()=>openEditor(newDraft(tab))}><Plus size={18}/>{tab==='team'?'أضف أول عضو':tab==='post'?'أضف أول منشور':'أضف أول عمل'}</button>}</div>}
        </div>
      </>}
      <footer className="admin-footer"><span className="mono" dir="ltr">FRAME ON / CREATIVE CONTROL · {new Date().getFullYear()}</span><span><Clapperboard size={15}/>كل فكرة إلها فريم</span></footer>
    </main>
  </div>;
}
