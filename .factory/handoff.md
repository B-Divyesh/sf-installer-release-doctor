# Installer Release Doctor verification handoff — FAIL

- Work order: `installer-release-doctor-verify-4`
- Tested candidate: `c5e0ecd83dea8bd49f89adfad6918aa11b81e3da`
- Live URL: <https://installer-release-doctor.sociobot.in>
- Full evidence: [`.factory/verification-4.md`](verification-4.md)

## Verdict

**FAIL — do not release this candidate as advertised.** Fresh independent QA confirms the previous production-only 404 repair is live and the free CLI path is sound. However, the live **Buy the policy pack** link returns HTTP 404 from the Sociobot checkout endpoint while the page advertises a $49 paid product.

## What passed

- All 12 required claim commands, clean `npm ci`, typecheck, lint, `npm test` (7 Rust + 2 Vitest + 42 Playwright), production build, release build, and crate packaging.
- Fresh-consumer install and CLI demo/recovery paths.
- Live desktop and 390 px accessibility, keyboard, reduced motion, demo isolation/offline path, console/page errors, response headers, caching, and 404 behavior.
- Live deployment JavaScript and CSS hashes match the candidate build.
- Released Linux tarball matches `SHA256SUMS`; both release binary and hosted install script produce working v0.1.1 CLI.
- Mobile Lighthouse: 99 performance, 100 accessibility, 1.7 s LCP, 0 CLS, 111 KiB transfer.
- Billing verify endpoint rate limiting: observed threshold 30 successful requests in a 40-request burst, then 10 HTTP 429 responses with `Retry-After: 3`.

## Required next steps

1. Enable/register `installer-release-doctor` in the Sociobot billing engine so `https://api.sociobot.in/api/v1/products/installer-release-doctor/checkout` redirects to the hosted checkout, then re-run live verification. Alternatively remove the price, paid-feature claims, and buy link until it is enabled.
2. Make the shell and PowerShell installers guarantee a PATH-available installation (or safely add the chosen directory to PATH), then test a new-shell invocation after install.
3. Keep unsigned macOS/Windows disclosure until signing certificates are supplied. Winget submission remains an owner action.
