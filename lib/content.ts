import { displayText } from './display-text';
export type Lang = 'ar' | 'en';
export type Media = { key: string; name: string; mime: string; size: number; role?: 'thumbnail' };
export type Entry = { id: string; kind: 'project' | 'team' | 'post'; category: string; titleAr: string; titleEn: string; descriptionAr: string; descriptionEn: string; media: Media[]; videoUrl: string; featured: boolean; published: boolean; createdAt: string; updatedAt: string };
export const postCategories = [
  { id: 'news', ar: 'أخبار', en: 'News' },
  { id: 'article', ar: 'مقالات', en: 'Articles' },
  { id: 'event', ar: 'فعاليات', en: 'Events' },
] as const;
export type Settings = { aboutAr: string; aboutEn: string; socials: { tiktok: string; snapchat: string; facebook: string; telegram: string; instagram: string; youtube: string; whatsapp: string } };
export type PublicData = { entries: Entry[]; settings: Settings };
export const defaultSettings: Settings = {
  aboutAr: "فريم أون للإنتاج الإعلامي تجمع صناعة الصورة والتسويق والتقنية ضمن رؤية واحدة نطوّر الأفكار ونحوّلها إلى إعلانات وأفلام ووثائقيات وبرامج ومسلسلات وتغطيات للفعاليات، من التحضير والسيناريو إلى التصوير والمونتاج والتلوين\n\nونكمل حضور المشروع بالمحتوى الرقمي والحملات التسويقية وتصميم المواقع وبرمجتها، مع مراجعات أمنية ضمن نطاق متفق عليه نبدي بفهم قصتك وجمهورك، نضع خطة واضحة، ونشتغل وياك على التنفيذ والمراجعة والتسليم",
  aboutEn: "Frame On Productions brings visual storytelling, marketing and technology together through one creative vision We develop ideas into commercials, films, documentaries, programs, series and event coverage, from planning and scripting to filming, editing and color\n\nWe extend that presence through digital content, marketing campaigns and custom website design and development, with security reviews within an agreed scope We start by understanding your story and audience, create a clear plan, and work with you through execution, review and delivery",
  socials: {
    tiktok: 'https://www.tiktok.com/@MS4wLjABAAAAp2wOsZJf0qESmjRdzQq1JzM1WJklOjwCprP1V0Lzi7_MUgF4aer04dRUcspNPu8o?_r=1&_t=ZS-9Agn41lKqQr',
    snapchat: 'https://www.snapchat.com/add/frameon26?share_id=UCUi_4OuYvw&locale=ar-IQ', facebook: 'https://www.facebook.com/share/1Ehpm3W6p9/', telegram: 'https://t.me/fRam_oN', instagram: '', youtube: '', whatsapp: '',
  },
};
export const categories = [
  { id: 'advertising', ar: 'الإعلانات', en: 'Advertising', shortAr: "فكرة تلفت وإعلان ينذكر", shortEn: "Make them look Make it memorable", descAr: "نحوّل رسالة علامتك إلى إعلان بصري، من الفكرة والسيناريو إلى التصوير والإخراج والمونتاج", descEn: "We turn your brand message into a visual commercial, from concept and script to filming, direction and the final edit", tagsAr: ['إعلانات تجارية', 'تصوير منتجات', 'ريلز إعلانية'], tagsEn: ['Commercials', 'Product films', 'Social ads'] },
  { id: 'films', ar: 'الأفلام', en: 'Films', shortAr: "أكو قصص تحتاج شاشة", shortEn: "Some stories belong on screen", descAr: "نبني عالم القصة بتكوين الصورة والإضاءة والصوت والمعالجة السينمائية، حسب متطلبات الفيلم", descEn: "We shape the world of a story through composition, lighting, sound and a cinematic approach tailored to the film", tagsAr: ['أفلام قصيرة', 'إخراج', 'مونتاج وتلوين'], tagsEn: ['Short films', 'Direction', 'Editing & color'] },
  { id: 'documentaries', ar: 'الأفلام الوثائقية', en: 'Documentaries', shortAr: "الحكاية الحقيقية تستحق تنحچي", shortEn: "Real stories A thoughtful lens", descAr: "من البحث والمقابلات إلى توثيق التفاصيل، نعطي الحكاية الحقيقية مساحة وصوت وصورة", descEn: "From research and interviews to the details in between, we give real stories the space, voice and imagery they deserve", tagsAr: ['بحث وإعداد', 'مقابلات', 'توثيق'], tagsEn: ['Research', 'Interviews', 'Documentation'] },
  { id: 'programs', ar: 'البرامج', en: 'Programs', shortAr: "من أول فكرة… إلى أول حلقة", shortEn: "From the first idea to the first episode", descAr: "نرتّب إنتاج البرامج الحوارية والثقافية والترفيهية، من الإعداد والاستوديو إلى النسخة النهائية", descEn: "We plan the production of interview, cultural and entertainment programs, from preparation and studio to final delivery", tagsAr: ['إعداد', 'تصوير متعدد الكاميرات', 'صوت ومونتاج'], tagsEn: ['Development', 'Multi-camera', 'Sound & editing'] },
  { id: 'series', ar: 'المسلسلات', en: 'Series', shortAr: "عالم كامل… مشهد ورا مشهد", shortEn: "A whole world, scene by scene", descAr: "نطوّر المعالجة البصرية للأعمال الدرامية والمحتوى المتسلسل، ونخطط للإنتاج بما يخدم الحكاية", descEn: "We develop the visual treatment of dramatic and episodic content, planning production around the needs of the story", tagsAr: ['دراما', 'معالجة بصرية', 'إنتاج حلقات'], tagsEn: ['Drama', 'Visual treatment', 'Episodic production'] },
  { id: 'marketing', ar: 'التسويق', en: 'Marketing', shortAr: "حضور واضح ورسالة توصل", shortEn: "A clear presence A message that connects", descAr: "نربط المحتوى البصري بخطة تسويقية تناسب هدف مشروعك وجمهورك، ونراجع النتائج حتى نطوّر الشغل", descEn: "We connect visual content to a marketing plan built around your goals and audience, and review results to improve the work", tagsAr: ['استراتيجية محتوى', 'حملات رقمية', 'إدارة منصات'], tagsEn: ['Content strategy', 'Digital campaigns', 'Social management'] },
  { id: 'events', ar: 'الإيفنتات', en: 'Events', shortAr: "اللحظة تمرّ… صورتها تبقى", shortEn: "The moment passes The story stays", descAr: "نخطط للتغطية الفوتوغرافية والفيديو للفعاليات والافتتاحات والمهرجانات، حتى نوثّق التفاصيل المهمة", descEn: "We plan photography and video coverage for events, launches and festivals, capturing the moments that matter", tagsAr: ['تغطية فعاليات', 'افتتاحات', 'فيديو ختامي'], tagsEn: ['Event coverage', 'Launches', 'Aftermovies'] },
  { id: 'electoral', ar: 'الحملات الانتخابية', en: 'Electoral campaigns', shortAr: "رسالة واضحة وإنتاج متكامل", shortEn: "A clear message Consistent production", descAr: "إنتاج إعلامي وتوثيق فعاليات وتصميم هوية بصرية للحملات الانتخابية، ضمن خطة تنفيذ واضحة ومتطلبات النشر", descEn: "Media production, event documentation and visual identity for electoral campaigns, with a clear delivery plan and publication requirements", tagsAr: ['هوية بصرية', 'إنتاج إعلامي', 'توثيق فعاليات'], tagsEn: ['Visual identity', 'Media production', 'Event documentation'] },
  { id: 'technology', ar: 'البرمجة والأمن السيبراني', en: 'Web & cybersecurity', shortAr: "موقع يعبّر عنك وتجربة تليق بيك", shortEn: "Your next big idea, built for the web", descAr: "نصمّم ونبرمج مواقع للشركات والمتاجر والأعمال، بواجهات عربية وإنكليزية وتجربة مريحة على الموبايل، مع مراجعة أمنية ضمن نطاق متفق عليه", descEn: "We design and build websites for companies, shops and businesses, with Arabic and English interfaces, a smooth mobile experience and security reviews within an agreed scope", tagsAr: ['مواقع مخصصة', 'واجهات وتجربة مستخدم', 'مراجعة أمنية'], tagsEn: ['Custom websites', 'UI & UX', 'Security reviews'] },
  { id: 'behind-scenes', ar: 'الكواليس', en: 'Behind the scenes', shortAr: "قبل المشهد… أكو شغل", shortEn: "Before the scene, there is the craft", descAr: "من التحضير وضبط الإضاءة إلى آخر تعديل بالمونتاج، هنا نشارك تفاصيل الرحلة وصناعة الصورة", descEn: "From preparation and lighting to the final edit, this is where we share the process and the craft behind the image", tagsAr: ['تحضير', 'تصوير', 'داخل الاستوديو'], tagsEn: ['Preparation', 'On set', 'Inside the studio'] },
  { id: 'studio-heart', ar: 'قلب الاستديو', en: 'Studio heart', shortAr: '', shortEn: '', descAr: '', descEn: '', tagsAr: [], tagsEn: [] },
] as const;
export const mediaUrl = (m: Media) => `/api/media/${m.key}`;
export const entryThumbnail = (entry: Pick<Entry, 'media'>) => entry.media.find(m => m.role === 'thumbnail' && m.mime.startsWith('image/')) || entry.media.find(m => m.mime.startsWith('image/'));
export function withThumbnail(media: Media[], thumbnail: Media): Media[] {
  return [{ ...thumbnail, role: 'thumbnail' }, ...media.filter(m => m.role !== 'thumbnail' && m.key !== thumbnail.key)];
}
export const textOf = (e: Entry, field: 'title' | 'description', l: Lang) => displayText(l === 'ar' ? e[field === 'title' ? 'titleAr' : 'descriptionAr'] : e[field === 'title' ? 'titleEn' : 'descriptionEn']);
export function videoEmbed(raw: string, autoplay = false): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw); if (u.protocol !== 'https:') return null;
    const host = u.hostname.toLowerCase().replace(/^www\./, ''); let id = '';
    if (host === 'youtu.be') id = u.pathname.slice(1);
    if (host === 'youtube.com') id = u.searchParams.get('v') || (u.pathname.startsWith('/shorts/') ? u.pathname.split('/')[2] : '');
    if (/^[A-Za-z0-9_-]{11}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}${autoplay ? '?autoplay=1&playsinline=1' : ''}`;
    if (host === 'vimeo.com' && /^\/\d+$/.test(u.pathname)) return `https://player.vimeo.com/video/${u.pathname.slice(1)}${autoplay ? '?autoplay=1&playsinline=1' : ''}`;
    return null;
  } catch { return null; }
}
