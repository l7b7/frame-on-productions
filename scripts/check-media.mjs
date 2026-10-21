import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

// Exercise the actual source and route handlers with isolated HTTP/cookie doubles.
// No credentials, production content, or live Supabase access are needed.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = await mkdtemp(path.join(root, 'node_modules', '.frameon-media-'));
const sources = ['lib/display-text.ts','lib/content.ts','lib/validation.ts','lib/errors.ts','lib/runtime.ts','lib/api.ts','lib/admin-request.ts','lib/prepare-image.ts','app/api/admin/media/route.ts','app/api/admin/media/complete/route.ts','app/api/admin/entries/route.ts','app/api/admin/entries/[id]/route.ts'];
const output = source => path.join(directory, source.replace(/\.ts$/, '.mjs'));
const originalFetch = globalThis.fetch;
const originalTimeout = globalThis.setTimeout;
const envKeys = ['SUPABASE_URL','SUPABASE_SECRET_KEY','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_ANON_KEY'];
const savedEnv = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
let checked = 0;
try {
  await writeFile(path.join(directory, 'cookies.mjs'), 'export async function cookies(){return globalThis.__frameMediaCookies;}');
  for (const source of sources) {
    let text = await readFile(path.join(root, source), 'utf8');
    text = text.replace(/from (['"])([^'"]+)\1/g, (whole, quote, specifier) => {
      if (specifier === 'next/headers') return `from ${JSON.stringify(pathToFileURL(path.join(directory, 'cookies.mjs')).href)}`;
      if (!specifier.startsWith('@/') && !specifier.startsWith('.')) return whole;
      const target = specifier.startsWith('@/') ? specifier.slice(2) + '.ts' : path.normalize(path.join(path.dirname(source), specifier + '.ts'));
      return `from ${JSON.stringify(pathToFileURL(output(target)).href)}`;
    });
    await mkdir(path.dirname(output(source)), { recursive: true });
    await writeFile(output(source), ts.transpileModule(text, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText);
  }
  const runtime = await import(pathToFileURL(output('lib/runtime.ts')).href);
  const content = await import(pathToFileURL(output('lib/content.ts')).href);
  const validation = await import(pathToFileURL(output('lib/validation.ts')).href);
  const mediaRoute = await import(pathToFileURL(output('app/api/admin/media/route.ts')).href);
  const completeRoute = await import(pathToFileURL(output('app/api/admin/media/complete/route.ts')).href);
  const entryRoute = await import(pathToFileURL(output('app/api/admin/entries/route.ts')).href);
  const updateRoute = await import(pathToFileURL(output('app/api/admin/entries/[id]/route.ts')).href);
  const { adminRequest } = await import(pathToFileURL(output('lib/admin-request.ts')).href);
  const { isAnimatedPng, prepareImage } = await import(pathToFileURL(output('lib/prepare-image.ts')).href);
  const id = '11111111-1111-4111-8111-111111111111';
  const key = 'media/22222222-2222-4222-8222-222222222222.mp4';
  const media = { key, name: 'film.mp4', mime: 'video/mp4', size: 35 * 1024 * 1024 };
  const bytes = new Uint8Array(32); bytes.set([0,0,0,24,102,116,121,112,109,112,52,50]);
  let signedIn, active, objectSize, objectMime, objectBytes, storageStatus, stuckCancel, blockedRead, rows, deletes, calls, signedKeys, objects;
  const json = (body, status = 200) => Response.json(body, { status });
  const cookies = new Map();
  globalThis.__frameMediaCookies = { get: name => cookies.has(name) ? { value: cookies.get(name) } : undefined, set: (name, value) => cookies.set(name, value) };
  const http = async (input, init = {}) => {
    const url = new URL(String(input)); const headers = new Headers(init.headers);
    calls.push({ path: url.pathname, method: init.method || 'GET', range: headers.get('range') });
    assert.equal(url.origin, 'https://example.supabase.co');
    if (url.pathname === '/auth/v1/user') return signedIn ? json({ id, email: 'test@example.test' }) : json({}, 401);
    assert.equal(headers.get('apikey'), 'sb_secret_fixture');
    assert.equal(headers.get('authorization'), null, 'modern secret is not a Bearer JWT');
    if (url.pathname === '/rest/v1/frame_admins') return json([{ is_active: active }]);
    if (url.pathname.startsWith('/storage/v1/object/upload/sign/')) {
      signedKeys.push(url.pathname);
      return json({ url: url.pathname.slice('/storage/v1'.length) + '?token=path-scoped-fixture' });
    }
    if (url.pathname.startsWith('/storage/v1/object/')) {
      if (init.method === 'DELETE') { deletes++; return json({}); }
      if (storageStatus !== 200) return json({}, storageStatus);
      if (blockedRead) return new Promise((resolve, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true }));
      const object = objects.get(decodeURIComponent(url.pathname.split('/frameon-media/')[1])) || { size: objectSize, mime: objectMime, bytes: objectBytes };
      return new Response(new ReadableStream({ start(controller) { controller.enqueue(object.bytes); if (!stuckCancel) controller.close(); }, cancel() { if (stuckCancel) return new Promise(() => {}); } }), { headers: { 'content-type': object.mime, 'content-length': String(object.size) } });
    }
    if (url.pathname === '/rest/v1/entries') {
      if (init.method === 'POST') { rows.push(JSON.parse(init.body)); return json([]); }
      if (init.method === 'PATCH') { Object.assign(rows.find(row => 'eq.' + row.id === url.searchParams.get('id')), JSON.parse(init.body)); return json([]); }
      let values = rows;
      if (url.searchParams.get('published')) values = values.filter(row => row.published);
      if (url.searchParams.get('media')) values = values.filter(row => row.media.some(item => item.key === JSON.parse(url.searchParams.get('media').slice(3))[0].key));
      return json(values);
    }
    throw Error('Unexpected fixture request: ' + url.pathname);
  };
  function reset() {
    Object.assign(process.env, { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_fixture', SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_fixture', SUPABASE_SERVICE_ROLE_KEY: '', SUPABASE_ANON_KEY: '' });
    cookies.clear(); cookies.set('frame_session', 'fixture-session'); signedIn = active = true;
    objectSize = media.size; objectMime = media.mime; objectBytes = bytes; storageStatus = 200;
    stuckCancel = blockedRead = false; rows = []; deletes = 0; calls = []; signedKeys = []; objects = new Map();
    globalThis.fetch = http; globalThis.setTimeout = originalTimeout;
  }
  const request = (value, origin = 'https://frameon.test', type = 'application/json') => new Request('https://frameon.test/api/admin/media', { method: 'POST', headers: { origin, 'content-type': type }, body: type === 'application/json' ? JSON.stringify(value) : 'fixture' });
  const metadata = { name: media.name, mime: media.mime, size: media.size };
  async function check(name, callback) { reset(); await callback(); checked++; console.log('PASS ' + name); }
  await check('anonymous upload authorization is denied', async () => { cookies.clear(); assert.equal((await mediaRoute.POST(request(metadata))).status, 401); assert.equal(signedKeys.length, 0); });
  await check('revoked administrators cannot authorize or complete uploads', async () => { active = false; assert.equal((await mediaRoute.POST(request(metadata))).status, 403); assert.equal((await completeRoute.POST(request(media))).status, 403); });
  await check('cross-origin upload authorization is denied', async () => { assert.equal((await mediaRoute.POST(request(metadata, 'https://outside.test'))).status, 403); assert.equal(calls.length, 0); });
  await check('35 MB upload receives a scoped token and the signed TUS route on the direct hostname', async () => {
    const response = await mediaRoute.POST(request(metadata)); assert.equal(response.status, 200);
    const plan = await response.json(); assert.equal(plan.mode, 'tus'); assert.equal(plan.endpoint, 'https://example.storage.supabase.co/storage/v1/upload/resumable/sign');
    assert.equal(plan.token, 'path-scoped-fixture'); assert.equal(plan.bucket, 'frameon-media'); assert.match(plan.media.key, validation.mediaKeyPattern);
    assert.equal(JSON.stringify(plan).includes('sb_secret'), false); assert.equal(calls.some(call => call.method === 'PUT'), false);
  });
  await check('50 MB metadata is accepted and larger files are rejected before signing', async () => {
    assert.equal((await mediaRoute.POST(request({ ...metadata, size: validation.MAX_MEDIA_BYTES }))).status, 200);
    assert.equal((await mediaRoute.POST(request({ ...metadata, size: validation.MAX_MEDIA_BYTES + 1 }))).status, 400); assert.equal(signedKeys.length, 1);
  });
  await check('bad MIME, empty files and null metadata are controlled validation errors', async () => { for (const value of [{ ...metadata, mime: 'text/html' }, { ...metadata, size: 0 }, null]) assert.equal((await mediaRoute.POST(request(value))).status, 400); });
  await check('multipart file payloads cannot enter the Vercel upload path', async () => { assert.equal((await mediaRoute.POST(request({}, 'https://frameon.test', 'multipart/form-data'))).status, 415); assert.equal(signedKeys.length, 0); });
  await check('animated GIF metadata, signatures and file keys are supported', async () => {
    const gif = { ...media, key: key.replace('.mp4', '.gif'), mime: 'image/gif' };
    assert.ok(validation.mediaSchema.safeParse(gif).success); assert.equal(validation.extension(gif.mime), 'gif'); assert.ok(validation.validSignature(new TextEncoder().encode('GIF89a fixture contents'), gif.mime));
    assert.equal((await mediaRoute.POST(request({ ...metadata, mime: gif.mime }))).status, 200);
  });
  await check('verification returns promptly even if stream cancellation never resolves', async () => {
    stuckCancel = true;
    const result = await Promise.race([runtime.completeUpload(media), new Promise((_, reject) => originalTimeout(() => reject(Error('Stream cancellation hung')), 500))]);
    assert.deepEqual(result, media); assert.ok(calls.some(call => call.range === 'bytes=0-31')); assert.equal(deletes, 0);
  });
  await check('verification is idempotent after a lost confirmation response', async () => { assert.deepEqual(await runtime.completeUpload(media), media); assert.deepEqual(await runtime.completeUpload(media), media); assert.equal(deletes, 0); });
  await check('signature and size mismatches are rejected without deleting stored content', async () => {
    objectBytes = new TextEncoder().encode('<html>not an MP4 file</html>'); assert.equal((await completeRoute.POST(request(media))).status, 400);
    objectBytes = bytes; objectSize--; assert.equal((await completeRoute.POST(request(media))).status, 400); assert.equal(deletes, 0);
  });
  await check('temporary Storage errors preserve the uploaded object for retry', async () => { storageStatus = 503; assert.equal((await completeRoute.POST(request(media))).status, 503); assert.equal(deletes, 0); });
  await check('stalled Storage checks return a JSON timeout instead of hanging', async () => {
    blockedRead = true; globalThis.setTimeout = (callback, delay, ...args) => originalTimeout(callback, delay === 12000 ? 2 : delay, ...args);
    const response = await completeRoute.POST(request(media)); assert.equal(response.status, 504); assert.match((await response.json()).error, /تأخر/); assert.equal(deletes, 0);
  });
  const draft = { kind: 'project', category: 'advertising', titleAr: 'اختبار معزول', titleEn: 'Isolated fixture', descriptionAr: '', descriptionEn: '', media: [media], videoUrl: '', published: false, featured: false };
  await check('studio-heart content keeps its category through save and public listing', async () => {
    const response = await entryRoute.POST(request({ ...draft, category: 'studio-heart', published: true })); assert.equal(response.status, 201);
    const { entry } = await response.json(); assert.equal(entry.category, 'studio-heart');
    const published = await runtime.listEntries(); assert.equal(published.length, 1); assert.equal(published[0].category, 'studio-heart');
  });
  await check('verified media can be saved privately and published through the real routes', async () => {
    const saved = await entryRoute.POST(request(draft)); assert.equal(saved.status, 201); const { entry } = await saved.json();
    assert.equal((await runtime.listEntries()).length, 0); cookies.clear(); assert.equal((await runtime.readMedia(key, new Request('https://frameon.test/api/media/' + key))).status, 404);
    cookies.set('frame_session', 'fixture-session'); assert.equal((await updateRoute.PUT(request({ ...entry, published: true }), { params: Promise.resolve({ id: entry.id }) })).status, 200);
    assert.equal((await runtime.listEntries()).length, 1); cookies.clear(); const publicMedia = await runtime.readMedia(key, new Request('https://frameon.test/api/media/' + key)); assert.equal(publicMedia.status, 200); await publicMedia.body.cancel();
  });
  const cover = { key: 'media/33333333-3333-4333-8333-333333333333.webp', name: 'cover.webp', mime: 'image/webp', size: 32000, role: 'thumbnail' };
  const coverBytes = new TextEncoder().encode('RIFF1234WEBP fixture image bytes');
  await check('a separate image cover and uploaded video survive draft save publish and replacement', async () => {
    objects.set(cover.key, { size: cover.size, mime: cover.mime, bytes: coverBytes });
    const saved = await entryRoute.POST(request({ ...draft, media: [media, cover] })); assert.equal(saved.status, 201);
    const { entry } = await saved.json(); assert.equal(content.entryThumbnail(entry).key, cover.key);
    assert.deepEqual(entry.media, [media, cover]); cookies.clear();
    assert.equal((await runtime.readMedia(cover.key, new Request('https://frameon.test/api/media/' + cover.key))).status, 404);
    cookies.set('frame_session', 'fixture-session');
    const response = await updateRoute.PUT(request({ ...entry, published: true }), { params: Promise.resolve({ id: entry.id }) });
    assert.equal(response.status, 200); const published = await runtime.listEntries(); assert.equal(published[0].media[1].role, 'thumbnail');
    cookies.clear(); const result = await runtime.readMedia(cover.key, new Request('https://frameon.test/api/media/' + cover.key)); assert.equal(result.status, 200); await result.body.cancel();
    const replacement = { ...cover, key: cover.key.replace('33333333-', '44444444-') };
    const changed = content.withThumbnail(entry.media, replacement); assert.deepEqual(changed, [replacement, media]);
  });
  await check('video covers reject non-images and multiple custom covers before any save', async () => {
    assert.equal((await entryRoute.POST(request({ ...draft, media: [{ ...media, role: 'thumbnail' }] }))).status, 400);
    assert.equal((await entryRoute.POST(request({ ...draft, media: [cover, { ...cover, key: cover.key.replace('33333333-', '44444444-') }] }))).status, 400);
    assert.equal(rows.length, 0);
  });
  await check('long linked videos persist an optional uploaded cover', async () => {
    objects.set(cover.key, { size: cover.size, mime: cover.mime, bytes: coverBytes });
    const response = await entryRoute.POST(request({ ...draft, media: [cover], videoUrl: 'https://vimeo.com/123456789', published: true }));
    assert.equal(response.status, 201); const { entry } = await response.json(); assert.equal(content.entryThumbnail(entry).key, cover.key);
    assert.equal((await runtime.listEntries())[0].media[0].role, 'thumbnail');
  });
  await check('legacy mixed galleries find their image cover and embedded autoplay is opt-in', async () => {
    const image = { ...cover }; delete image.role;
    assert.equal(content.entryThumbnail({ media: [media, image] }).key, cover.key);
    assert.equal(content.entryThumbnail({ media: [media] }), undefined);
    for (const url of ['https://youtu.be/dQw4w9WgXcQ', 'https://vimeo.com/123456789']) {
      assert.equal(new URL(content.videoEmbed(url)).searchParams.has('autoplay'), false);
      assert.equal(new URL(content.videoEmbed(url, true)).searchParams.get('autoplay'), '1');
      assert.equal(new URL(content.videoEmbed(url, true)).searchParams.get('playsinline'), '1');
    }
    assert.equal(content.videoEmbed('https://outside.test/video', true), null);
  });
  await check('long YouTube video links publish without a binary upload', async () => { const response = await entryRoute.POST(request({ ...draft, media: [], videoUrl: 'https://youtu.be/dQw4w9WgXcQ', published: true })); assert.equal(response.status, 201); assert.equal(signedKeys.length, 0); });
  await check('untrusted video link hosts are rejected', async () => { assert.equal((await entryRoute.POST(request({ ...draft, media: [], videoUrl: 'https://outside.test/video' }))).status, 400); });
  await check('HTML proxy errors return actionable text without leaking the HTML', async () => { globalThis.fetch = async () => new Response('<html>private diagnostics</html>', { status: 504 }); await assert.rejects(adminRequest('/fixture'), error => /تأخر/.test(error.message) && !error.message.includes('<html>')); });
  await check('successful malformed JSON is reported with its HTTP status', async () => { globalThis.fetch = async () => new Response(''); await assert.rejects(adminRequest('/fixture'), /HTTP 200/); });
  await check('normal JSON, auth errors and network errors remain readable', async () => {
    globalThis.fetch = async () => json({ ok: true }); assert.deepEqual(await adminRequest('/fixture'), { ok: true });
    globalThis.fetch = async () => json({ error: 'سجّل دخولك' }, 401); await assert.rejects(adminRequest('/fixture'), /سجّل/);
    globalThis.fetch = async () => { throw new TypeError('Network fixture'); }; await assert.rejects(adminRequest('/fixture'), /الاتصال/);
  });
  await check('aborting an admin request interrupts it', async () => { globalThis.fetch = async (_, init) => new Promise((resolve, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))); const controller = new AbortController(); const pending = adminRequest('/fixture', { signal: controller.signal }); controller.abort(); await assert.rejects(pending, /إيقاف/); });
  await check('video-cover preparation preserves the selected bytes without using canvas for any image quality', async () => {
    const originalObjectURL = URL.createObjectURL; let conversions = 0;
    URL.createObjectURL = () => { conversions++; throw Error('Unexpected cover conversion'); };
    try {
      for (const mime of ['image/jpeg', 'image/png', 'image/webp', 'image/gif']) {
        const file = new File([new Uint8Array([255,216,255,1,2,3,4,5])], 'selected.' + validation.extension(mime), { type: mime });
        for (const quality of ['balanced', 'small', 'original']) {
          const result = await prepareImage(file, quality, 'thumbnail');
          assert.equal(result.file, file); assert.equal(result.file.type, mime); assert.equal(result.file.name, file.name);
          assert.deepEqual(new Uint8Array(await result.file.arrayBuffer()), new Uint8Array(await file.arrayBuffer()));
        }
      }
      assert.equal(conversions, 0, 'cover preparation must never enter the canvas conversion path');
    } finally { URL.createObjectURL = originalObjectURL; }
  });
  await check('APNG animation is detected before image recompression', async () => {
    const png = new Uint8Array(32); png.set([137,80,78,71,13,10,26,10]); png.set(new TextEncoder().encode('acTL'), 12); assert.equal(await isAnimatedPng(new Blob([png])), true);
    png.set(new TextEncoder().encode('IDAT'), 12); assert.equal(await isAnimatedPng(new Blob([png])), false);
  });
  console.log(`Verified ${checked} isolated media/backend checks. No production login or real Storage transfer was performed by this script.`);
} finally {
  globalThis.fetch = originalFetch; globalThis.setTimeout = originalTimeout; delete globalThis.__frameMediaCookies;
  for (const key of envKeys) if (savedEnv[key] === undefined) delete process.env[key]; else process.env[key] = savedEnv[key];
  await rm(directory, { recursive: true, force: true });
}
