# Cyber-Cinema administration interface

The private administration area uses a charcoal palette with restrained mint, blue, gold and Frame On red accents. A code-native shield/aperture mark connects the production and technical identities. Styles are scoped to the administration route and its login interface.

The dashboard computes four cards from the selected library: total entries, published entries, drafts, and video files/links (team images on the team tab). Clicking a card filters the list. Search composes with that filter, and “عرض الكل” clears both. The publication bar derives its segments from the same published/draft counts; no simulated server, security or audience metrics are displayed.

The editor groups bilingual story fields and publication choices separately from media upload, the optional original-image thumbnail, and linked long-form video. Existing signed resumable uploads, original cover byte preservation, save endpoints, draft visibility, authentication and account permissions remain in use. Navigation and editor closing are unavailable during active upload/save operations. The login retains its labeled email/password form, password visibility control and existing sign-in behavior.

Verification performed:

- Next production build and TypeScript pass
- 36 DOM interaction checks, including actual card counts, library filtering, search composition, settings retention and the existing auth/media/public-viewer behavior
- 27 isolated backend/media checks, plus presentation-copy checks
- 10 isolated real browser TUS client checks, including byte-identical original PNG cover transfer and upload retry/pause/resume
- Rendered QA with the actual production components in Arabic at 320, 390, 1280 and 1440 CSS-pixel viewports
- At 320 px, the document and editor had no horizontal overflow; both save/cancel controls exceeded 44 px height
- At 390 px, the cover card and settings had no horizontal overflow; the login password input used 16 px type and a 56 px touch height
- Desktop editor fields/media rendered in separate columns at 1280 px

The screenshots used isolated, clearly labeled sample entries and a non-personal staff label. Those fixtures are not part of production data. Mobile viewport checks do not represent physical iOS/Android device testing. Decorative aperture movement respects reduced-motion preferences.
