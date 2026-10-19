'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUpLeft, ArrowUpRight, Clapperboard, Code2, ShieldCheck, Play, Menu, X, Plus, Check, Copy, Camera, ExternalLink } from 'lucide-react';
import { categories, type Entry, type Lang, type PublicData, mediaUrl, textOf, videoEmbed } from '@/lib/content';
import Brand from './Brand';
import ServicesMenu from './ServicesMenu';
import MotionScene, { MotionToggle, useSceneMotion } from './MotionScene';

export default function Studio({lang,initial}: {lang: Lang; initial: PublicData}) {
  const ar = lang === 'ar'; const t = (a: string,e: string) => ar ? a : e;
  const [menu,setMenu] = useState(false); const motion = useSceneMotion();
  const [activeService,setActiveService] = useState<string>('advertising');
  const [filter,setFilter] = useState('all'); const [selected,setSelected] = useState<Entry | null>(null);
  const [toast,setToast] = useState(''); const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialog = useRef<HTMLDialogElement>(null); const [brief,setBrief] = useState('');
  const [briefCopied,setBriefCopied] = useState(false);
  const arrow = ar ? <ArrowUpLeft size={18}/> : <ArrowUpRight size={18}/>;
  const projects = initial.entries.filter(e => e.kind === 'project'); const team = initial.entries.filter(e => e.kind === 'team');
  const shown = filter === 'all' ? projects : projects.filter(e => e.category === filter);
  const socials = Object.entries(initial.settings.socials).filter(([,v]) => !!v);
  function notify(message: string) { setToast(message); if(toastTimer.current) clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''),4500); }
  useEffect(() => {
    document.documentElement.lang = lang; document.documentElement.dir = ar ? 'rtl' : 'ltr';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const obs = new IntersectionObserver(entries => entries.forEach(e => {if(e.isIntersecting){e.target.classList.add('revealed');obs.unobserve(e.target);}}),{threshold:0.12});
    document.querySelectorAll('[data-reveal]').forEach(el => {el.classList.add('reveal-pending');obs.observe(el);});
    return () => { obs.disconnect(); if(toastTimer.current) clearTimeout(toastTimer.current); };
  },[lang,ar]);
  useEffect(() => {
    if(selected) {dialog.current?.showModal(); document.body.style.overflow='hidden';}
    else {dialog.current?.close(); document.body.style.overflow='';}
    return () => {document.body.style.overflow='';};
  },[selected]);
  function pickService(id: string) { setActiveService(id); setFilter(id); setMenu(false); document.getElementById('services')?.scrollIntoView({behavior:'smooth'}); }
  function createBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const f = new FormData(event.currentTarget);
    const b = `${t('طلب مشروع جديد — فريم أون','New project inquiry — Frame On')}\n${t('الاسم','Name')}: ${f.get('name')}\n${t('الخدمة','Service')}: ${f.get('service')}\n${t('الفكرة','Brief')}: ${f.get('idea')}`;
    setBrief(b);setBriefCopied(false);
  }
  async function copyBrief() { try {await navigator.clipboard.writeText(brief);setBriefCopied(true);notify(t('اننسخ الملخص. افتح تيليگرام وأرسله إلنا.','Brief copied. Open Telegram and send it to us.'));} catch {notify(t('تگدر تحدد النص وتنسخه يدوياً.','Select the text below and copy it manually.'));} }
  return <div className={`studio lang-${lang} ${motion.paused ? 'motion-paused' : ''}`} lang={lang} dir={ar?'rtl':'ltr'}>
    <a className="skip-link" href="#main">{t('انتقل للمحتوى','Skip to content')}</a>
    <header className="site-header">
      <Brand href={`/${lang}`} />
      <nav className={`main-nav ${menu?'open':''}`} aria-label={t('القائمة الرئيسية','Main navigation')}>
        <a className="nav-active" href="#home" onClick={()=>setMenu(false)}>{t('الرئيسية','Home')}</a>
        <a href="#about" onClick={()=>setMenu(false)}>{t('منو إحنا','The studio')}</a>
        <ServicesMenu lang={lang} onSelect={pickService} />
        <a href="#work" onClick={()=>setMenu(false)}>{t('أعمالنا','Our work')}</a>
        <a href="#team" onClick={()=>setMenu(false)}>{t('الإدارة','Our team')}</a>
      </nav>
      <div className="header-actions"><a href={ar?'/en':'/ar'} className="language-switch" lang={ar?'en':'ar'}>{ar?'EN':'عربي'}</a><a className="button small" href="#contact">{t('نبدأ مشروعك','Let’s talk')}{arrow}</a><button className="mobile-toggle" aria-label={t('فتح القائمة','Toggle menu')} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div>
    </header>

    <main id="main">
      <section className="hero" id="home">
        <MotionScene paused={motion.paused} variant="hero" flipped={!ar} />
        <div className="hero-meta mono" dir="ltr"><span><i className="rec-dot"/> CREATIVE STUDIO</span><span>FRAME ON — VISION IN MOTION</span></div>
        <div className="hero-content"><div className="hero-kicker"><span className="red-line"/>{t('من الفكرة… إلى الشاشة','FROM IDEA TO SCREEN')}</div>
          <h1>{ar?<><span>إنت تتخيّل…</span><span>وإحنا نصنع</span><em>المشهد.</em></>:<><span>YOU</span><span>IMAGINE.</span><em>WE CREATE.</em></>}</h1>
          <p>{t('إنتاج إعلامي، رؤية إبداعية، وتجارب رقمية. نحول فكرتك إلى صورة تحچي عنك وتبقى بالذاكرة.','Film production, creative vision and digital experiences. We turn your ideas into stories that are seen, felt and remembered.')}</p>
          <div className="hero-buttons"><a className="button" href="#work">{t('اكتشف شغلنا','Explore our work')}{arrow}</a><a className="text-button" href="#contact">{t('عندك فكرة؟ خل نحچي','Got an idea? Let’s talk')}<span className="circle-arrow">{arrow}</span></a></div>
        </div>
        <div className="hero-bottom"><a href="#about" className="scroll-cue"><span className="scroll-icon"><ArrowDown size={15}/></span><span>{t('كمّل الحكاية','SCROLL TO DISCOVER')}</span></a><span className="hero-frame mono" dir="ltr">[ F / O ]<span>EVERY FRAME TELLS A STORY.</span></span><div className="hero-utilities"><MotionToggle paused={motion.paused} reduced={motion.reduced} onToggle={motion.toggle} ar={ar} /><span className="hero-count mono" dir="ltr"><b>01</b> / FRAME ON</span></div></div>
      </section>

      <div className="discipline-strip marquee-strip" aria-hidden="true" dir="ltr"><div className="marquee-track">{[0,1].map(copy=><div className="marquee-group" key={copy}><span>FILM & PRODUCTION</span><i>✳</i><span>BRANDS & STORIES</span><i>✳</i><span>DIGITAL EXPERIENCES</span><i>✳</i><span>FRAME ON</span><i>✳</i></div>)}</div></div>

      <section className="section about" id="about">
        <div className="section-label mono" dir="ltr"><span className="rec-dot"/>01 / THE STUDIO</div>
        <div className="about-layout" data-reveal><div><span className="about-kicker">{t('منو فريم أون؟','MEET FRAME ON')}</span><h2>{t('كل فكرة إلها صورة.','Every idea has an image.')}<br/><span className="muted">{t('وكل صورة إلها حكاية.','Every image has a story.')}</span></h2></div><div className="about-copy"><p>{ar?initial.settings.aboutAr:initial.settings.aboutEn}</p><a className="inline-link" href="#services">{t('تعرّف على عالم فريم أون','Step inside Frame On')}{arrow}</a></div></div>
        <div className="studio-values about-pillars" data-reveal>
          <article><span className="pillar-icon"><Clapperboard size={24}/><span className="mono">01 / PRODUCTION</span></span><h3>{t('نصنع الحكاية.','We tell the story.')}</h3><p>{t('من كتابة الفكرة والسيناريو إلى التصوير والإخراج والمونتاج والتلوين. إعلانات، أفلام، وثائقيات، برامج، وتغطيات تليق بقصتك.','From concept and script to filming, direction, editing and color. Commercials, films, documentaries, programs and coverage shaped around your story.')}</p><button className="inline-link" onClick={()=>pickService('advertising')}>{t('الإنتاج الإعلامي','Explore production')}{arrow}</button></article>
          <article><span className="pillar-icon"><Camera size={24}/><span className="mono">02 / PRESENCE</span></span><h3>{t('نبني حضورك.','We shape your presence.')}</h3><p>{t('محتوى للمنصات، تصوير منتجات، وحملات تسويقية تبدأ بهدف واضح وجمهور محدد. نخلي الصورة والرسالة يشتغلن سوية حتى تعبّر علامتك عن نفسها.','Platform content, product photography and marketing campaigns start with a clear goal and audience. We bring image and message together to express your brand.')}</p><button className="inline-link" onClick={()=>pickService('marketing')}>{t('التسويق والمحتوى','Marketing & content')}{arrow}</button></article>
          <article><span className="pillar-icon"><Code2 size={24}/><span className="mono">03 / EXPERIENCE</span></span><h3>{t('نبرمج تجربتك.','We build your experience.')}</h3><p>{t('مواقع للشركات والمتاجر والأعمال، بواجهات عربية وإنكليزية وتجربة مناسبة لكل الشاشات، مع مراجعات أمنية ضمن نطاق متفق عليه.','Websites for companies, shops and businesses, with Arabic and English interfaces and an experience that fits every screen, plus security reviews within an agreed scope.')}</p><a className="inline-link" href="#digital">{t('المواقع والبرمجة','Web & development')}{arrow}</a></article>
        </div>
        <div className="about-next"><p>{t('نبدي بفهم فكرتك، نحدّد نطاق الشغل، ونمشي وياك من التخطيط للتنفيذ والتسليم.','We start by understanding the idea, agree on the scope, and work with you from planning through production and delivery.')}</p><a className="inline-link" href="#process">{t('شوف شلون نشتغل','See how we work')}{arrow}</a></div>
      </section>

      <section className="section services-section" id="services">
        <div className="section-label mono" dir="ltr"><span className="rec-dot"/>02 / WHAT WE DO</div>
        <div className="section-heading" data-reveal><h2>{t('فكرتك، إلها مكان عدنا.','Your idea has a home here.')}</h2><p>{t('من صناعة المشهد إلى بناء حضورك الرقمي.','From making the scene to building your digital presence.')}</p></div>
        <div className="services-layout"><div className="service-aside" data-reveal><div className="service-visual"><img src="/hero-cinema.png" alt={t('تصوّر بصري سينمائي لكاميرا داخل استوديو','Cinematic concept image of a camera in a studio')} loading="lazy"/><span className="visual-corner top"/><span className="visual-corner bottom"/><span className="mono visual-caption">THE ART OF MAKING IT REAL.</span><Clapperboard size={40}/></div><p>{t('كل خدمة تبدي بسؤال واحد: شنو الحكاية اللي تريد تحچيها؟','Every service starts with one question: what is the story you want to tell?')}</p></div>
          <div className="service-list">{categories.map((c,i)=><article key={c.id} className={`service-row ${activeService===c.id?'active':''}`}><h3><button aria-expanded={activeService===c.id} aria-controls={`service-${c.id}`} onClick={()=>setActiveService(activeService===c.id?'':c.id)}><span className="service-num mono">{String(i+1).padStart(2,'0')}</span><span>{ar?c.ar:c.en}</span><Plus size={19}/></button></h3><div className="service-detail" id={`service-${c.id}`} hidden={activeService!==c.id}><h4>{ar?c.shortAr:c.shortEn}</h4><p>{ar?c.descAr:c.descEn}</p><div className="tags">{(ar?c.tagsAr:c.tagsEn).map(s=><span key={s}>{s}</span>)}</div><button className="inline-link" onClick={()=>{setFilter(c.id);document.getElementById('work')?.scrollIntoView({behavior:'smooth'});}}>{t('شوف الأعمال بهذا القسم','Explore this category')}{arrow}</button></div></article>)}</div>
        </div>
      </section>

      <section className="section work-section" id="work">
        <div className="section-label mono" dir="ltr"><span className="rec-dot"/>03 / THE WORK</div>
        <div className="section-heading" data-reveal><h2>{t('حكايات تنشاف.','Stories you can see.')}</h2><p>{t('مساحة لأعمالنا، ولكل مشهد نصنعه.','A place for our work, and every scene we create.')}</p></div>
        <div className="work-filters" role="group" aria-label={t('تصفية الأعمال حسب القسم','Filter projects by category')}><button className={filter==='all'?'selected':''} aria-pressed={filter==='all'} onClick={()=>setFilter('all')}>{t('كل الأعمال','All work')}</button>{categories.map(c=><button key={c.id} className={filter===c.id?'selected':''} aria-pressed={filter===c.id} onClick={()=>setFilter(c.id)}>{ar?c.ar:c.en}</button>)}</div>
        {shown.length>0?<div className="project-grid">{shown.map((e,i)=><button className={`project-card ${i===0?'featured-card':''}`} key={e.id} onClick={()=>setSelected(e)}><div className="project-thumb">{e.media[0]?.mime.startsWith('image/')?<img src={mediaUrl(e.media[0])} alt={textOf(e,'title',lang)} loading="lazy"/>:e.media[0]?.mime.startsWith('video/')?<video src={mediaUrl(e.media[0])} muted playsInline preload="metadata"/>:<div className="video-placeholder"><Clapperboard size={52}/></div>}<span className="project-play"><Play size={20} fill="currentColor"/></span>{e.featured&&<span className="project-featured">{t('عمل مختار','SELECTED WORK')}</span>}</div><div className="project-caption"><div><span className="project-category">{categories.find(c=>c.id===e.category)?.[lang]}</span><h3>{textOf(e,'title',lang)}</h3></div>{arrow}</div></button>)}</div>:<div className="work-empty"><div className="empty-frame" aria-hidden="true"><span className="mono">F / O</span><Camera size={36}/><span className="mono">THE NEXT SCENE</span></div><div><span className="eyebrow">COMING INTO FRAME</span><h3>{t('المشهد الجاي ممكن يكون إلك.','The next scene could be yours.')}</h3><p>{filter==='all'?t('نختار أعمالنا بعناية. قريباً، حكايات جديدة تنعرض هنا.','We curate our work with care. New stories will be shared here soon.'):t('قريباً نشارك أعمال هذا القسم. خل نحچي عن فكرتك.','We will share work in this category soon. Let’s talk about your idea.')}</p><a className="inline-link" href="#contact">{t('خلّينا نسمع فكرتك','Tell us what you have in mind')}{arrow}</a></div></div>}
      </section>

      <section className="digital-section" id="digital"><div className="digital-content"><div className="section-label mono" dir="ltr"><span className="rec-dot"/>04 / BEYOND THE FRAME</div><span className="eyebrow">DESIGN. DEVELOP. PROTECT.</span><h2>{t('شغلك يستحق','Your work deserves')}<br/><span>{t('موقع يشبهك.','a site that feels like you.')}</span></h2><p>{t('واجهة تلفت، تجربة سهلة، وموقع ينمو ويا مشروعك. نبني حضورك الرقمي بنفس الاهتمام اللي نصنع بيه المشهد.','A striking interface, an easy experience, and a website that grows with your business. We build your digital presence with the same care we bring to the screen.')}</p><div className="digital-features"><span><Code2 size={17}/>{t('تصميم وبرمجة حسب الطلب','Custom design & development')}</span><span><ShieldCheck size={17}/>{t('مراجعة أمنية ضمن نطاق متفق عليه','Security reviews with an agreed scope')}</span><span><Check size={17}/>{t('عربي، إنكليزي، وكل الشاشات','Arabic, English, every screen')}</span></div><a className="button" href="#contact" onClick={()=>setFilter('technology')}>{t('أريد موقع لمشروعي','Build my website')}{arrow}</a></div>
        <div className="browser-scene" dir="ltr" aria-label={t('تصوّر توضيحي لتصميم موقع، وليس مشروع عميل','Illustrative web design concept, not a client project')}><span className="browser-concept mono">WEB DESIGN / CONCEPT</span><div className="desktop-browser"><div className="browser-bar"><span><i/><i/><i/></span><span>your-next-idea.com</span><span>↗</span></div><div className="mock-nav"><b>YOUR BRAND<span>®</span></b><span>ABOUT &nbsp; WORK &nbsp; CONTACT</span></div><div className="mock-body"><span className="mono">BUILT TO STAND OUT.</span><h3>THE NEXT<br/>BIG <i>THING.</i></h3><span className="mock-link">START SOMETHING ↗</span><div className="mock-orbit"/></div><div className="mock-bottom mono"><span>MADE FOR YOUR AMBITION.</span><b>01 — 03</b></div></div><div className="mobile-browser"><div className="phone-notch"/><div className="phone-nav">YOUR BRAND <Menu size={14}/></div><div className="phone-body"><span>THINK BIG.</span><b>GO<br/><i>BEYOND.</i></b><div className="phone-orb"/><span className="phone-button">LET’S BEGIN ↗</span></div></div><span className="browser-note mono">RESPONSIVE BY DESIGN. FRAME ON BY NATURE.</span></div>
      </section>

      <section className="section process-section" id="process"><div className="section-label mono" dir="ltr"><span className="rec-dot"/>05 / THE PROCESS</div><div className="section-heading" data-reveal><h2>{t('من أول حچي… إلى آخر تفصيل.','From the first conversation to the final detail.')}</h2></div><div className="process-grid" data-reveal>{[
        [t('نسمعك','We listen'),t('نحچي عن فكرتك، هدفك، وجمهورك. ونحدد شنو تحتاج فعلاً.','We talk through the idea, the audience and what you actually need.')],
        [t('نرسم الرؤية','We find the vision'),t('نرتّب التصوّر وخطة التنفيذ ونوضح مراحل الشغل وياك.','We shape a direction, a clear plan and the stages of the work.')],
        [t('نصنعها','We make it'),t('إنتاج، تصميم، أو برمجة. نبني الفكرة خطوة بخطوة.','Production, design or development. We bring the idea to life, step by step.')],
        [t('نسلّم المشهد','We deliver'),t('نراجع التفاصيل وياك، ونسلّم الشغل بصيغته المتفق عليها.','We review the details with you and deliver the work as agreed.')],
      ].map(([h,p],i)=><div key={i}><span className="process-num mono">0{i+1}<span>↗</span></span><h3>{h}</h3><p>{p}</p></div>)}</div></section>

      <section className="section team-section" id="team"><div className="section-label mono" dir="ltr"><span className="rec-dot"/>06 / THE PEOPLE</div><div className="team-intro" data-reveal><h2>{t('وراء كل مشهد،','Behind every frame,')}<br/><span className="muted">{t('شغل فريق.','a collective vision.')}</span></h2><p>{t('الإدارة والفريق الإبداعي يجمعهم هدف واحد: نفهم قصتك، ونحوّلها إلى شغل تفتخر بيه.','Our management and creative team share one goal: understand your story and turn it into work you are proud of.')}</p></div>{team.length>0?<div className="team-grid">{team.map(e=><article key={e.id}>{e.media[0]?.mime.startsWith('image/')&&<img src={mediaUrl(e.media[0])} alt={textOf(e,'title',lang)} loading="lazy"/>}<h3>{textOf(e,'title',lang)}</h3><p>{textOf(e,'description',lang)}</p></article>)}</div>:<div className="team-signature" dir="ltr"><span>ONE VISION.</span><span>EVERY FRAME.</span><img src="/brand-logo-transparent.png" alt="Frame On Productions" width="90" height="90"/></div>}</section>

      <section className="section contact-section" id="contact"><div className="section-label mono" dir="ltr"><span className="rec-dot"/>07 / LET’S MAKE IT HAPPEN</div><div className="contact-layout"><div className="contact-title" data-reveal><h2>{t('عندك فكرة؟','Have an idea?')}<br/><em>{t('شغّل الفريم.','Let’s frame it.')}</em></h2><p>{t('إعلان، فيلم، موقع، أو حكاية بعد ما انحچت. نحب نسمعها.','A commercial, a film, a website, or a story that is still waiting to be told. We would love to hear it.')}</p>{initial.settings.socials.telegram&&<a className="inline-link" href={initial.settings.socials.telegram} target="_blank" rel="noopener noreferrer">{t('احچي ويانا على تيليگرام','Talk to us on Telegram')}{arrow}</a>}<div className="social-links">{socials.map(([name,url])=><a key={name} href={url} target="_blank" rel="noopener noreferrer">{name.charAt(0).toUpperCase()+name.slice(1)}<ExternalLink size={13}/></a>)}</div></div>
        <div className="brief-panel"><h3>{t('خل نرتّب فكرتك.','Let’s put your idea into words.')}</h3><p>{t('جهّز ملخصك، انسخه، وأرسله إلنا على حسابنا.','Prepare a short brief, copy it, and send it to our account.')}</p><form onSubmit={createBrief}><label>{t('اسمك أو اسم المشروع','Your name or business')}<input name="name" required maxLength={120} placeholder={t('شنو اسمك؟','What should we call you?')} autoComplete="name"/></label><label>{t('شنو تحتاج؟','What do you need?')}<select name="service" required defaultValue=""><option value="" disabled>{t('اختار الخدمة','Choose a service')}</option>{categories.map(c=><option key={c.id}>{ar?c.ar:c.en}</option>)}</select></label><label>{t('احچي لنا عن الفكرة','Tell us about the idea')}<textarea name="idea" required rows={3} maxLength={3000} placeholder={t('عن مشروعك، وشلون تتخيّل النتيجة…','A little about your project and what you have in mind…')}/></label><button className="button full" type="submit">{t('جهّز ملخص المشروع','Prepare project brief')}{arrow}</button></form>{brief&&<div className="brief-result"><label>{t('ملخصك جاهز للنسخ والإرسال','Your brief is ready to copy and send')}<textarea readOnly value={brief} rows={5}/></label><div><button className="button small secondary" onClick={copyBrief}>{briefCopied?<Check size={16}/>:<Copy size={16}/>}{t('انسخ الملخص','Copy brief')}</button>{initial.settings.socials.telegram&&<a className="button small" href={initial.settings.socials.telegram} target="_blank" rel="noopener noreferrer">{t('افتح تيليگرام','Open Telegram')}{arrow}</a>}</div><small>{t('الطلب ينرسل من حسابك بعد ما تفتح المحادثة وتلصق الملخص.','Send from your own account after opening the chat and pasting the brief.')}</small></div>}</div></div></section>
    </main>
    <footer className="site-footer"><div className="footer-wordmark" dir="ltr">FRAME <span>ON</span><sup>F/O</sup></div><div className="footer-bottom"><span>© {new Date().getFullYear()} FRAME ON PRODUCTIONS</span><span>{t('إنت تتخيّل… وإحنا نصنع المشهد.','YOU IMAGINE. WE CREATE THE SCENE.')}</span><div><a href="/">{t('اختيار اللغة','Language')}</a><a href="#home">{t('للأعلى','Back to top')}<ArrowUpRight size={13}/></a></div></div></footer>
    {toast&&<div className="toast" role="status"><Check size={17}/>{toast}</div>}
    <dialog ref={dialog} className="project-dialog" onCancel={()=>setSelected(null)} onClose={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}} aria-labelledby="project-title">{selected&&<div className="dialog-content"><button className="dialog-close" onClick={()=>setSelected(null)} aria-label={t('إغلاق','Close')}><X/></button><span className="eyebrow">{categories.find(c=>c.id===selected.category)?.[lang]}</span><h2 id="project-title">{textOf(selected,'title',lang)}</h2><p>{textOf(selected,'description',lang)}</p><div className="project-gallery">{selected.videoUrl&&videoEmbed(selected.videoUrl)&&<iframe title={textOf(selected,'title',lang)} src={videoEmbed(selected.videoUrl)!} allow="fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-presentation"/>}{selected.media.map(m=>m.mime.startsWith('video/')?<video key={m.key} controls playsInline src={mediaUrl(m)} preload="metadata"/>:<img key={m.key} src={mediaUrl(m)} alt={textOf(selected,'title',lang)} loading="lazy"/>)}</div><a className="button" href="#contact" onClick={()=>setSelected(null)}>{t('خل نصنع مشروعك الجاي','Let’s make your next project')}{arrow}</a></div>}</dialog>
  </div>;
}
