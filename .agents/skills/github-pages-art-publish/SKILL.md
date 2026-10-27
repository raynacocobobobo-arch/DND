---
name: github-pages-art-publish
description: Publish user-approved artwork to GitHub Pages through the proven Google Docs -> GitHub Actions -> gh-pages process, verify lossless images and live gallery, then clean temporary resources. Use for 上传, 替换, 上网址, 上线, GitHub Pages image publishing. Never claim binary uploads are impossible before trying this verified workflow.
---

# Verified GitHub Pages Artwork Publisher


## Cross-conversation standing instruction · 跨对话永久项目规范（2026-10-27）

**User instruction (confirmed repeatedly):** When asked to 上线、上传、替换、发布 GitHub Pages artwork or website updates for this project, the assistant must **attempt the publication in the current chat** and must **not ask the user to change conversations**, imply that it lacks ability, or say GitHub cannot upload images without first checking which GitHub + Google Drive connector actions are actually available and trying the previously validated relay.

**Connection check first:** Query the available connector action catalog at runtime for GitHub file/workflow actions and Google Drive document/image actions; make safe read-only requests to confirm access. Absence from a small visible tool list does not imply unavailable capabilities: discover via the orchestration tool catalog first. GitHub `fetch_file` and Google Drive `list_folder(root)` are sufficient for initial access checks. Actual write capability is confirmed by write responses, not inferred from read alone.

**Fixed proven binary publishing chain:** approved `/mnt/data/<user-approved original>` PNG → disposable native Google Doc `create_file` → `batch_update_document` `insertInlineImage` with `image_uris` → `get_document` for that image's `inlineObjects[*].embeddedObject.imageProperties.contentUri` → construct one-time GitHub Actions workflow from the bundled template with an accurately indented manifest → main workflow runs reusable `scripts/transfer_art.py` → lossless full-sized WebP plus thumbnails committed to `gh-pages` → update `gh-pages/assets/<suit>-approved-v1.js` and `index.html` cache-busting URL → GitHub Actions-based real-site HTTP/Pillow pixel SHA256/Selenium QA with recorded PASS → delete temporary workflow and Google Doc → comment in project Issue #2 / add repo release note.

**Never fake success:** Creation of the workflow is not a successful upload; verify real `gh-pages` blobs and public image URLs, actual detail pages and original-pixel identity. If image file unavailable, report exact obstacle and attempt verification/recovery; never silently regenerate an already-approved card. Never publish unapproved alternatives. The 22 Major Arcana images must remain unchanged unless user explicitly revises that lock.

**Cross-chat entry point and record:** This file is the project's persistent operational memory, in `main` of `raynacocobobobo-arch/DND`; the next conversation should fetch and follow it rather than asking the user to repeat instructions. The user specifically requested this workflow be reused across conversations on 2026-10-27. This repository record remains available independently of the chat product's automatic personal Memory behavior.

## Principles

- **Reuse the verified workflow.** GitHub text-only connector actions cannot directly commit binary artwork, but the temporary Google Docs image relay plus GitHub Actions binary commit **does work**. Do not confuse tool limitations with inability to complete the task.
- **Respect image approval.** Never generate, redraw, stretch, substitute or alter approved image content without the user's explicit request. An upload request does not authorize re-generation.
- **Perform the work** when the GitHub and Google Drive connectors are available. Do not substitute an explanation of how to upload for the requested upload.
- **Proof before claiming success.** Workflow YAML creation is not an image upload; a GitHub commit is not verified public deployment. Test real image responses, app routes and browser rendering.
- **No public production paperwork.** Never expose 台账, 审核, 已定稿 status, audit blocks or oversized approval images in visitor-facing galleries. Preserve the Major Arcana gallery-and-detail layout.
- Never post credentials or signed URLs in user-facing messages. Never commit API keys or tokens to the repository.

## Known-good environment

- GitHub repository: raynacocobobobo-arch/DND
- Source/workflows branch: main
- Actual Pages publication branch: gh-pages
- Public site: https://raynacocobobobo-arch.github.io/DND/
- Site files on gh-pages: index.html, assets/arcana-app-v3.js, assets/arcana-pages-v3.css, assets/cups-approved-v1.js, assets/wands-approved-v1.js
- Artwork paths: minor-arcana/<suit>/final/<slug>-of-<suit>-vN.webp and minor-arcana/<suit>/thumbs/<slug>-of-<suit>-vN.webp
- Successful precedent on 2026-10-26: corrected Cups IV/VI/IX/X and Wands Ace, followed by live GitHub Actions/Pillow/Selenium verification.
- Skill and permanent files belong on main; approved image binaries belong on gh-pages. Verify each target branch before writing.

## Phase 0: Inspect and verify the approved source

1. Discover available GitHub and Google Drive connector tools rather than assuming they vanished. Existing connected actions include mcp__GitHub__fetch_file, create_file, update_file, fetch, delete_file, fetch_workflow_run_jobs, fetch_workflow_job_logs; and Google Drive create_file, batch_update_document, get_document, delete_file.
2. Check the source image path (often /mnt/data/<approved filename>) and its real pixel dimensions using Pillow, if available. Never guess a file path, card identity, accepted design or resolution.
3. Inspect current gh-pages card-data JS, app routes, index imports and artwork folder structure. Preserve user changes made since prior conversations.
4. Confirm which exact paintings are approved and must be published. Do not treat other incomplete cards as approved.

## Phase 1: Relay original artwork via a disposable Google Doc

1. Google Drive create_file: a temporary native Google document.
2. Google Drive batch_update_document: insert each actual local image using insertInlineImage, passing the genuine image local path in image_uris. Collect replies[].insertInlineImage.objectId.
3. Google Drive get_document: extract the matching tabs[0].inlineObjects[objectId].inlineObjectProperties.embeddedObject.imageProperties.contentUri. This is normally a time-limited https://docs.google.com/docs-images-rt/... URL.
4. Pair each image URI with its intended suit, slug, explicitly verified expected_size, versioned full-art path and thumbnail path. Keep the signed URLs **only in a one-time workflow**, and delete that workflow after a confirmed release.

## Phase 2: Actual binary transfer to gh-pages

1. Open templates/one-time-approved-art-upload.yml.tmpl from this skill.
2. Populate the JSON manifest placeholder with verified entries. Example item:
   {"name":"权杖王牌","source_url":"<real Google Doc contentUri>","expected_size":[941,1672],"output_path":"minor-arcana/wands/final/ace-of-wands-v2.webp","thumb_path":"minor-arcana/wands/thumbs/ace-of-wands-v2.webp"}
3. Replace the placeholder manifest in the template, preserving YAML indentation and literal JSON. Create the temporary workflow at .github/workflows/one-time-approved-art-upload.yml on main, matching its push path filter (or use a unique temporary path and update the filter as well).
4. Workflow checks out main for this skill's scripts and gh-pages for actual site files. scripts/transfer_art.py downloads the verified Google Docs source, asserts explicitly approved dimensions, writes **lossless** WebP, verifies decoded original-vs-WebP pixel identity, creates a separate thumbnail, emits hashes, stages only the generated artwork files and pushes to gh-pages.
5. Do not overwrite previous images by default; use a new version suffix. An optional manifest expected_pixel_sha256 can additionally verify source artwork pixels against a hash computed locally, not merely equality after the Docs relay.
6. Check GitHub Actions run status, job conclusion and log markers. Confirm actual binary paths in the gh-pages git tree. If the signed URL expired or was transcoded to the wrong size, renew the temporary image relay; do not use a placeholder or unapproved alternate image.

## Phase 3: Integrate the actual gallery and card detail

1. Update the corresponding suit data JS in gh-pages, using the **real deployed** high-definition and thumbnail paths with fresh cache-busting URL params.
2. If this is the first card of a suit, add that suit's import and nav entry in index.html, its hash route in routeParts and render switch in assets/arcana-app-v3.js, and an appropriately styled library/detail route.
3. Reuse the existing Major Arcana library-card, library-grid, detail-layout and detail-copy. Detail should include the approved art, standalone story, visual reading, upright and reversed meanings, literary adaptation, reflection.
4. Update drawing pools/counts only after full HD art exists. Preserve all previously published Major/Cups/suit cards. Do not create any public ledger, audit or King-sized approval section.
5. Make the site mobile responsive and bump script/style cache versions.

## Phase 4: Test the actual public website, not just repository code

- Verify latest Pages deployment status=completed and conclusion=success.
- Public HTML must contain new script/version markers; actual image URL must return HTTP 200, be readable by Pillow, have expected WebP dimensions and be the correct artwork.
- Use the proven browser workflow .github/workflows/wands-ace-live-qa.yml as an example for new Selenium/Chrome tests of library grid, detail text, image naturalWidth/naturalHeight, direct deep-link, draw pool, existing galleries and mobile layout.
- Require explicit PASS markers from GitHub Actions job logs. Do not claim website launch before these checks pass.

## Phase 5: Clean up after successful release

1. Delete the disposable one-time transfer workflow using fresh main branch blob SHA.
2. Delete the temporary Google Doc. Do not delete original published files or permanent QA workflow/Skill.
3. Respond with public gallery URL, specific card detail URL, image resolution, deployment result and QA status. Do not mention secrets or relay URLs.

## Troubleshooting

- "GitHub connector cannot upload images": use disposable Google Doc -> Actions -> gh-pages; don't stop.
- Source file missing: inspect mounted /mnt/data rather than fabricating a path.
- Missing inlineObjects contentUri: verify returned objectId and Google Doc shape; retry insertion.
- Image size mismatch: fail closed. Check the source or Docs relay; never rescale unasked.
- YAML parsing error or run failure: inspect the Actions run, job steps and logs, fix the temporary workflow and rerun.
- Webpage shows old asset: verify gh-pages blob, card data paths, index script versions and actual Pages build.
- Website lacks navigation or single-card pages: update imports, nav, routing, detail and draw integration; test in browser.
- Cross-repository reuse: first verify the other site's real Pages branch and layout; do not assume DND paths apply.

## Included helpers

- scripts/transfer_art.py — safe path checks, signed-source download and retry, lossless WebP with pixel verification, thumbnails, exact staging output
- tests/test_transfer_art.py — offline unit tests
- templates/one-time-approved-art-upload.yml.tmpl — create temporarily at GitHub Actions workflow path; never store real signed URLs permanently
- references/site-integration.md — source of truth for Tarot site integrations and visual QA

**Priority: repeat a proven working approach before asserting that the work cannot be done.**
