## Video covers and one-click playback — 2026-10-21

The project/post editor now has a separate optional **غلاف الفيديو** image uploader, saved-cover preview, replacement and removal actions. It reuses the signed resumable upload pipeline and preserves the exact selected file for covers, without canvas or WebP re-encoding. Gallery image compression remains available. Ordinary gallery images can also be selected as the cover. The cover counts toward the existing 12-file allowance; replacing a cover at the limit is supported.

A cover is an image in the existing `entries.media` JSONB array with `role: "thumbnail"`. No SQL migration or environment-variable change is needed. Validation accepts at most one custom cover and rejects a video carrying that role. Existing private-media authorization remains based on the referenced media key. Unpublished covers remain private; publication makes the cover available through the same media route. Older entries fall back to their first image, including when a video precedes it in the array.

Project and journal cards display the selected cover. Opening an entry mounts its primary uploaded video and calls `play()` synchronously during the original click, with `playsInline`, native controls and the selected poster. A custom cover is not duplicated ahead of the video in the gallery. Closing the viewer pauses playback and removes its player. Linked YouTube/Vimeo players request autoplay only when there is no uploaded primary video. Provider/browser restrictions can still prevent embedded playback; native uploaded-video playback refusals show accessible recovery controls.

Validation performed:

- Production Next build and TypeScript pass
- 26 isolated media/backend checks, including cover save/publication/privacy, replacement, legacy fallback, linked-video covers and invalid/duplicate-cover rejection
- 33 DOM interaction checks, including a single synchronous play call from a card click, journal playback, poster/gallery order, close/pause and rejected-play recovery
- 9 isolated real TUS-client upload checks, including the dedicated image-only cover uploader at the media limit, retry, pause/resume and image compression
- Rendered Chrome responsive checks at 320/390 CSS px and 1440 CSS px, Arabic project and English journal cards, plus the new cover panel
- The uploaded-video fixture started from one click (`paused=false`, playback time advanced); the 320 px layout had `scrollWidth=clientWidth=320`

The visual QA used a local fixture rendered with the actual production component, not a published customer project. Mobile viewport checks are not physical iOS/Android device tests. The fixture is not included in the production site data.

Usage: open a project/post, upload the video (or add its YouTube/Vimeo link), use **اختيار صورة الغلاف**, then **حفظ المسودة** or **حفظ ونشر**. The thumbnail upload alone does not publish content.

## Original-cover color preservation

A reported green-striped cover was present in the stored converted image itself. Cover preparation now bypasses browser canvas/re-encoding and uploads the selected JPEG, PNG, WebP or GIF bytes unchanged. The cover panel no longer offers compression settings; covers over 50 MiB are rejected before signing. Previously converted images cannot be reconstructed from the green output: select the original again and save the replacement.

Regression coverage checks identity/bytes/MIME/name for all supported cover formats and all quality inputs while the conversion path is instrumented to fail if called. The actual TUS-client fixture also checks an original PNG transfer byte for byte.
