# Verification record

The initial Sites implementation passed TypeScript checking and a production Vinext build. Twenty integration checks ran against the compiled Worker with isolated D1 and R2 resources:

1. Welcome page and Arabic/English links.
2. Arabic public page without a visitor account.
3. English public page without a visitor account.
4. Unsupported language returns 404.
5. Anonymous admin reads return 401.
6. Signed-in users outside the admin allowlist return 403.
7. Cross-origin writes return 403.
8. Anonymous same-origin writes return 401.
9. Valid image upload by an administrator.
10. Uploaded unattached files are private.
11. HTML disguised as an image is rejected.
12. Creating a draft.
13. Draft content is absent from the public portfolio.
14. Authorized administration can view draft media.
15. Publishing a draft.
16. Published content and media are visible to visitors.
17. Media byte ranges are served correctly.
18. Invalid social URLs are rejected.
19. Unpublishing revokes public file access.
20. Deleting content.

The exported Next.js version is checked separately with TypeScript and a production Next.js build. Its backend adapter uses Supabase Auth, a server-checked `frame_admins` membership table, PostgreSQL and private Storage. Live Supabase authentication, signed uploads and deployment to the user's Vercel account require the user's project configuration and have not been exercised against a real Supabase account in this session. The Sites tests do not validate Supabase itself.

Browser automation was unavailable in this environment. Responsive CSS and reduced-motion handling are included, but visual rendering and real browser interactions have not been verified here. This record describes functional checks, not a complete penetration test or an assurance that the application has no vulnerabilities.

## Interface revision 2

The revised navigation and motion controls additionally passed 14 DOM interaction checks using React and an isolated JSDOM environment:

1. Mouse hover opens all ten service choices.
2. Moving the pointer from the trigger into the dropdown keeps it open.
3. Moving outside closes the dropdown.
4. A touch hover does not open it.
5. Touch taps toggle it open and closed.
6. Touch taps also toggle correctly on a hybrid device with mouse-hover support.
7. ArrowDown opens the list and focuses its first choice.
8. End and Home move focus within the service list.
9. Escape closes it and restores focus to the trigger.
10. Selecting a service returns the correct category and closes the list.
11. An outside pointer press dismisses the list.
12. The motion control pauses animation and saves the preference.
13. The saved pause preference survives a page remount.
14. The device's reduced-motion preference pauses animation and disables forced motion.

The logo asset was checked for a real alpha channel. The public masthead uses the extracted FO emblem in an SVG viewport and scalable text; the welcome screen no longer displays the original square JPEG or the earlier language cards. The background is an animated still composition with light and haze layers, not an AI-generated video. Animation pauses off-screen or when the document is hidden, and reduced-motion preferences are respected. The content database and uploaded files retain their existing identity.

DOM interaction checks do not validate CSS layout or visual browser rendering. The visual verification limitation above still applies.

## Interface and access revision 3

The opening screen now uses `public/intro-lens.png`, a centered full-frame lens composition, symmetric shading, viewfinder corners and CSS lens/reflection motion. The public Arabic and English pages contain no administration link or login form. The staff login screen is implemented independently in `AdminAccess.tsx` at the existing `/admin` route.

The DOM interaction suite now passes 19 checks: the prior 14, plus the new welcome asset and language links, off-screen scene suspension/resumption, labeled independent staff login, password visibility without form submission, and disabled unconfigured login with accessible error text.

`node scripts/check-portable-auth.mjs` passes 12 additional checks using the real portable backend bundled with a cookie stub and mocked Supabase HTTP responses:

1. Public defaults work and login remains unavailable without backend configuration.
2. Anonymous requests have no admin rights; no legacy environment allowlist is required.
3. Invalid passwords create no session.
4. A valid Auth user without a `frame_admins` membership cannot log in, even if a legacy allowlist variable remains set.
5. Inactive staff cannot log in.
6. Active staff can log in with secure HTTP-only, same-site cookies.
7. Changing membership to inactive blocks reads and writes from an existing session.
8. Removing membership also blocks an existing session.
9. Cross-origin login and write requests are rejected.
10. Membership database failures deny access and return a controlled error response.
11. Active staff sessions can refresh after the access token expires.
12. Revoked staff cannot refresh an authorized session.

The 20 compiled Worker integration checks were rerun, including delivery of the new image and absence of admin links from public pages. Together these checks total 51. Mocked backend checks do not exercise an actual Supabase project or SQL deployment. Visual browser rendering remains unverified in this environment.

## Clean installation for external hosting

The first GitHub publication exposed a portability defect in the earlier npm lockfile: it referenced nine dependency symlinks from the Sites development checkout. That lockfile was replaced with a registry-based npm lock generated in a separate directory containing no shared `node_modules`. The exported manifest also now includes the `clsx` and `tailwind-merge` dependencies imported by `lib/utils.ts`.

After the correction, a fresh `npm ci --no-audit --no-fund` installed the application dependencies in that isolated directory, and `npm run build` completed successfully, including the TypeScript check and generation of public pages. All 65 lockfile package entries are portable, with no local dependency links or filesystem resolution paths. This clean installation supersedes the earlier build verification that used the development checkout's shared dependencies.

Live hosting status must be read from Vercel separately. Supabase accounts, storage and environment variables still require the owner's configuration.

## Staff publishing and database setup revision

The CMS now supports a separate `post` kind with news, article and event categories, including text-only publication. The public studio journal filters those categories and excludes drafts. The SQL setup upgrades the existing kind constraint without deleting rows and provides a SQL-Editor-only `frame_grant_admin(email, name)` helper for existing Auth users. Browser roles have no execute permission on this helper.

The backend accepts modern `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY` settings as well as legacy aliases. Modern secret keys are sent in the `apikey` header and are never used as a Bearer JWT. Site metadata now defaults to the actual production origin.

Validation for this revision:

- Production Next.js build and TypeScript passed in the isolated clean-install directory.
- 18 backend checks passed with mocked HTTP responses and a cookie jar. They include modern and legacy key handling, login/logout, live membership revocation, text-only draft creation and publishing through the real route handlers, invalid content rejection and denied writes by revoked staff.
- 24 React/JSDOM interaction checks passed, including the staff journal tab, default draft state, category choices, public category filtering, draft exclusion and opening the selected article. These checks do not perform visual browser rendering.

The live admin URL returned HTTP 200; its session endpoint reported `configured:false`, and unauthenticated entries requests returned 401 before this update. The installed Vercel connector returned 403 for the known project scope, and no authenticated Vercel CLI was available. Actual Supabase schema execution, real staff login and media uploads remain unverified until the owner configures a Supabase project and production environment keys. No production test content or staff account was created.

## Supabase initialization — 20 October 2026

The owner supplied project `ekmjwxygttypbyiigjei` (`frame-on-productions`). The connected Supabase tools confirmed an active, healthy project with no public application tables, Auth accounts or media bucket. The committed `supabase/setup.sql` was then applied successfully as migration `20261020034645_frame_on_initial_cms`.

Database verification confirmed all three application tables, RLS enabled, no direct table access for anonymous/authenticated browser roles, and explicit server-role read/write grants. The admin grant helper uses security invoker and cannot be executed by anonymous/authenticated roles. The `frameon-media` bucket is private, accepts the intended image/video MIME types, and enforces the 30 MB per-file limit.

A transaction running as `service_role` successfully created, read, updated and deleted a draft, then rolled back. No test content was retained. Security Advisor returned only three informational `rls_enabled_no_policy` notices, one per server-only table; no public/user policy is needed for this access model. See [the advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

The production session endpoint still returned HTTP 200 with `configured:false`. Auth accounts and active admin memberships were both zero at verification time. Real email/password login and media upload through Vercel remain untested until the owner creates a staff account, grants membership and saves the production connection keys. The Arabic setup guide now documents those steps using dashboard fields without requiring SQL.


## Login form recovery — 20 October 2026

The sign-in submit button no longer stays disabled because an earlier session probe reported an unconfigured backend. Only an in-flight submission disables it, and the server continues to enforce configuration, origin, password and active membership checks. Failed initial session probes now leave the login form available with the actual error message. Existing authorized sessions still use the dashboard load-error screen when loading content fails.

Session lookup and password submission have a 20-second timeout, clear their timer on every completion path, and report a readable retry message. Login trims incidental whitespace from the email without changing the password. The unconfigured server response now identifies Production settings and redeployment as the required action; it never returns key values.

Five behavior checks passed against the exact timeout helper after removing its type annotations, with request, clock and AbortController doubles: response/payload preservation, authorization error preservation, network error preservation, timeout duration, and aborted-request messaging/timer cleanup. These are isolated JavaScript checks, not browser or real Supabase login tests. The previous UI check that expected an unconfigured submit button to be disabled describes the old behavior and is superseded by this revision.

Supabase confirmed one account with a password, a confirmed email, active admin membership and no current ban. Production inspection through the Vercel connector returned 403 for the deployment's project/team; the public web retrieval tool could not read its URL. The local execution environment and supplied image paths were unavailable. A fresh build is tracked by Vercel's status on the new GitHub commit. A real browser login and upload still need verification after deployment using the owner's account.


## Production connection diagnostics — 20 October 2026

The owner reported the new HTTP 503 configuration message, confirming the deployed server could not find one or more required Supabase settings. The active Vercel connection returned no visible teams and previously denied access to the deployment's project/team with 403, so production values could not be inspected or changed through that connection.

The session response and unconfigured login response now include `configurationMissing`, containing only canonical variable names. The login error lists the missing names directly. Server-side reads normalize incidental whitespace and retain both modern and legacy key aliases. Key values never appear in these diagnostics.

Eight isolated configuration checks passed against the changed helper after removing its single parameter type annotation: empty settings, URL only, each individual missing key, modern settings with whitespace, legacy settings, blank-modern/valid-legacy fallback, and whitespace-only rejection without value disclosure. These checks do not confirm the owner's saved Vercel values. Actual production connection, browser login and upload remain pending until the missing values are saved on the project serving the production domain and a new deployment loads them.
## Media upload recovery — 21 October 2026

The owner reported an unreadable server response after uploading a short MP4. Supabase Storage logs confirmed a successful signed PUT and subsequent authenticated object GET for that file. The file exists in the private bucket. A Vercel function stack trace was not available, so the precise production exception has not been established. The revised verification reads only the signature prefix, has a 12-second timeout, and no longer waits for cancellation of Next.js' wrapped stream. A regression fixture demonstrates that verification returns even when the stream's cancellation promise never settles. Failed or timed-out confirmation does not delete the object.

File bytes now use the browser TUS client directly against the Storage hostname with a path-scoped signed upload token. No service key or Auth JWT is sent to the client, and no file payload passes through a Vercel Function. Chunks are 6 MiB, transient failures retry, progress is visible, and pause/manual retry reuse the same in-memory upload URL. Reloading the page discards that queue. Confirmation is retried separately after successful transfer. Admin control requests report HTTP/non-JSON/network/timeout errors without displaying HTML responses.

The connected Supabase organization was verified as Free. Its bucket limit was increased from 30 MiB to the plan's 50 MiB ceiling and GIF was added to the MIME allowlist; the bucket remains private. Native larger-than-50-MiB uploads have not been enabled. The editor makes the existing YouTube/Vimeo long-video path explicit and provides opt-in preview. JPEG/static PNG images have optional browser compression at two quality levels; original files are kept if encoding fails or produces a larger result. GIF, WebP and animated PNG are preserved. Videos are not transcoded in the browser.

Validation for this revision:

- Production Next.js build and TypeScript passed using isolated registry-installed dependencies. The lockfile has 86 portable package entries and no filesystem links.
- `npm run test:media` passes 21 isolated checks against the actual source/route handlers: authorization/origin/size/type limits, path-scoped TUS plans, GIF, bounded signature reads, non-settling cancellation, idempotent confirmation, storage failures/timeouts, draft/published visibility, long-video URLs, and readable client errors. HTTP/cookies are fixtures; this script does not log in to production.
- Eight React/JSDOM upload checks use the real browser TUS client against an isolated HTTP server. They exercise chunk retry, progress, pause/resume, confirmation retry without retransmission, partial batch recovery, long-video preview/validation and compression selection with image/canvas doubles.
- The existing 18 authentication/backend checks and 24 UI interaction checks pass, including the current enabled login behavior and unchanged publishing controls.

Production email/password sign-in was verified through the secure browser authentication flow without exposing credentials. The signed-in dashboard loaded and showed zero entries. However, after the source update the production editor still displayed the old 30 MB uploader, and GitHub reported no Vercel status/check for the new commits. The connected Vercel account previously denied this project/team with HTTP 403. Live testing of the revised uploader, real browser image encoding and playback is therefore blocked on deployment of the new source. No production upload test was performed, and no owner file or account was removed or replaced.
