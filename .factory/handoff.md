# Installer Release Doctor review 1 handoff

- Work order: `installer-release-doctor-review-1`
- Role: adversarial first-read reviewer
- Candidate: `e914afb1fcf67e9eb4f74f2383102c25e20bef14`
- Live URL: <https://installer-release-doctor.sociobot.in>
- Verdict: **FAIL**

## What was done

Wrote `.factory/review-1.md` with the complete cold first-read, landing and README copy inventory, demo/privacy checks, all declared claim results, history verification, structure/link/metadata/accessibility checks, missed-leverage assessment, and 34 concrete findings. Product code was not changed.

## Verification

- Opened the live site in fresh Chromium contexts at 390 × 844 and 1366 × 768.
- Exercised `/demo`, **Run release check**, **Show repair**, **Reset demo**, **Start for real**, offline reload, storage inspection, and request logging.
- Crawled every live link and fragment across `/`, `/demo`, `/privacy`, `/terms`, and an HTTP 404.
- Checked route titles, h1 count, headings, metadata, canonical URLs, overflow, focus/back behavior, console output, and Axe results.
- Created a clean local clone at `/tmp/ird-review-1-clean-yq5RWe/repo`, ran `npm ci`, and ran each of the 24 commands recorded in `.factory/claims.json` separately. All commands passed in both Playwright projects; the review records seven incomplete observable assertions despite green status.
- Ran the CLI demo from `/tmp/ird-review-1-cli-sQ1uqh` with network proxies disabled. It returned expected status 1, emitted valid JSON, and created `/tmp/release-doctor-demo-L0zeCZ`.
- Confirmed `dist/site` was produced in the clean clone. Initial built JS is about 16 KiB on disk.

## What remains

The release fails review. The primary desktop action is below the first viewport, the 404 contains a dead `/#pricing` link, seven claim regressions do not observe their full claims, public copy includes unlisted claims, route metadata is incomplete, and plain-language/accessibility issues remain. See `.factory/review-1.md` for exact evidence and fixes.
