# Tarot site integration and browser QA

## Existing site reference

Repository: https://github.com/raynacocobobobo-arch/DND

GitHub Pages: https://raynacocobobobo-arch.github.io/DND/

Repository main is for skills and GitHub Actions; gh-pages is the **published** site. Always fetch latest site files with ref=gh-pages and use each file's fresh blob SHA for updates.

| Scope | Source file on gh-pages | Live route |
|---|---|---|
| Cover/nav/scripts | index.html | /#/home |
| Major Arcana | assets/arcana-catalog-v3.js, assets/arcana-depth-v2.js, assets/arcana-app-v3.js | /#/library/1; /#/card/{0..21} |
| Cups | assets/cups-approved-v1.js, assets/arcana-app-v3.js | /#/library/cups/1; /#/card/cups/{slug} |
| Wands | assets/wands-approved-v1.js, assets/arcana-app-v3.js | /#/library/wands; /#/card/wands/{slug} |
| Styling | assets/arcana-pages-v3.css | all pages |
| Actual artwork | minor-arcana/{suit}/final/*-vN.webp | static asset path |
| Thumbnails | minor-arcana/{suit}/thumbs/*.webp | static asset path |

## Site integration changes for new cards

1. Read latest relevant asset catalog/renderer/index from gh-pages. Preserve 22 Major and 14 Cups entries; don't duplicate IDs.
2. Add one approved suit data record with id, slug, zh, en, title, img, thumb, story, visual, up, rev, canon, question, suitMeaning and status approved. The artwork URL must be the real binary already committed, never a placeholder.
3. For a new suit, add data script BEFORE arcana-app-v3.js in index.html, nav link with proper data-route-nav, routeParts handler for gallery and detail, and render() screens.
4. Use existing "page library" with "library-panel" / "library-grid" / "library-card" for gallery; "page detail" + "detail-layout", "detail-art", "detail-copy" for detail. No special approval/ledger cards.
5. Keep six segments: original story, visual language, upright, reversed, literary roots, reflection. Stories can be creative but do not falsely attribute invented events to Lovecraft originals.
6. Add only genuinely uploaded and accepted image records to the draw pool. Update total pool labels, e.g. 22 major + 14 Cups + 1 Wands = 37, without removing older cards.
7. Bump CSS and JS query strings whenever their content changes. Preserve direct hash-link routing.
8. For each additional Wands card, gallery expansion should use the same pagination conventions as Cups/Majors; no isolated review pages or internal manufacturing registers.

## Browser QA checklist

Use Selenium and headless Chrome on GitHub Actions, following the existing test workflow .github/workflows/wands-ace-live-qa.yml and .github/workflows/cups-clean-ui-qa.yml:

- Fetch site root with cache-busting query; wait for expected fresh script marker in public HTML.
- Fetch each newly published WebP, assert HTTP 200, Image.format WEBP, Image.size approved [width,height]. Confirm image contents correspond to approved source, especially numerals / suit symbol counts; programmatic pixels alone do not prove design semantics.
- Major Arcana gallery must still have 22 total. Cups stays 14. New suit's count is the number actually published.
- Opening card gallery should produce library-card images, titles and correct detail navigation. Direct hash URL to detail must show detail-layout and successful image decode.
- Check each card page for story, symbolism, upright, reversed and literary adaptation. Verify absence of 台账/审核/已定稿 in visible content.
- Draw from all cards and verify new approved card can be selected without regressing the old draw.
- Mobile viewport around 390 × 844: verify navbar visible and no horizontal overflow.
- Deployment success is corroborated by status and conclusion of GitHub Actions Pages build.
- Only after browser PASS and image 200 can you state the card is **online**.

## Temporary transfer workflow rules

- Author it as a new file on main; its own push filter must match its name.
- Signed Google Doc URLs may expire. Renew the Doc relay and temporary workflow rather than use stale links.
- Avoid leaking signed URLs in chat or retaining them in permanent repo history when practicable. Cleaning the temporary workflow does **not erase prior Git history**, so treat them as short-lived transfer credentials and share cautiously.
- In GitHub logs, confirm both decoded source-pixel equality and successful gh-pages commit.
- Once the site is confirmed live, delete the temporary workflow and temporary Google Doc; do not delete this permanent skill or original artwork.
