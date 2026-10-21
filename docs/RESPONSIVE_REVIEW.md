# Mobile interface revision — 21 October 2026

The public Arabic/English experience now uses a larger reading scale, high-contrast copy and oval action controls. The hero headline fills the mobile content width, its secondary CTA uses ivory against the dark scene, and the production strip repeats FO marks. About/service paragraphs are larger, their links/tags are rounded, and the team headline is followed by the Frame On lockup regardless of whether team members have been added.

The studio-journal heading is a direct `#behind-scenes` link that selects the behind-the-scenes work category. The previous explanatory/empty journal paragraphs have been removed. Existing published journal posts still work. The contact brief has exactly four fields: name, phone, email and idea. It validates the phone and browser email field, normalizes Arabic/Persian digits, and prepares/copies the brief locally. It does not send an email or submit a lead automatically. Standalone Telegram CTAs have been removed; contact/footer navigation uses branded social marks.

Facebook, Snapchat, Telegram and TikTok use the owner's supplied account URLs. Instagram has no URL in the source settings or the connected database settings. Its mark is present with an unavailable label and no fabricated destination. Saving the official Instagram URL in **النصوص والتواصل** enables its link automatically.

## Browser evidence

The actual React components and final CSS were exercised in Chrome through the supported Sites preview supervisor. An iframe harness set the document's CSS viewport size; it is not an iOS/Safari or Android hardware test. A direct Next.js development preview rendered server HTML but did not hydrate through that preview setup, so it was replaced for UI QA with a static bundle of the same source components. The production Next.js build was checked separately. QA harness files are not part of the application or this repository.

Arabic and English were measured at **320, 360, 375, 390, 430 and 768 CSS pixels**:

- No page-width overflow or clipped hero, contact or team headings was observed
- Main action links, service buttons, social links and contact inputs met the 44-pixel minimum height check
- Hero body copy was 17 px at phone widths; About copy was 18 px
- Contact inputs/textareas were 16 px, with the single-line inputs approximately 59 px high
- Rendered paragraphs/headings had no terminal full stops

The 1440-pixel desktop header also fit without overflow. The language screen was checked at 320/390/430 pixels, and its English choice opened the English interface. The staff login screen was checked at the same widths; the final 320-pixel check measured the return link at 45 px, password visibility at 48 px, inputs at 56 px and submit at approximately 57 px.

Actual interactions verified:

1. Mobile menu opens; service selection closes it and opens the chosen service
2. The studio link selects the behind-the-scenes category and updates the fragment
3. An invalid phone prevents brief generation
4. Arabic-digit phone entry is normalized in the generated brief, which includes name, phone, email and idea
5. Copying shows the success message
6. The motion control pauses the FO marquee, and the footer return link reaches the hero
7. Footer links retain the configured URLs and open a separate tab with `noopener noreferrer`

![Arabic mobile preview at 390 × 844 CSS pixels](qa/mobile-390.jpg)

## Build and regression checks

- Production `npm run build`, including TypeScript, passed
- `npm run test:copy` passed punctuation, paragraph, ellipsis, decimal, email and URL cases
- The 21 isolated media/backend checks and 18 authentication/backend checks passed
- The existing 24 React/JSDOM interaction checks passed

The new layout and the prior resumable-upload changes still require deployment to the Vercel production project. The connected Vercel account denied that project/team with 403 in the preceding work. No production publication or successful upload of the revised interface is claimed by this record.
