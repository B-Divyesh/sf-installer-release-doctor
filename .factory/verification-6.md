# Independent verification 6 — PASS

- **Candidate:** `ad24207668641c3abdd70e83fac64a9e7ce75d30`
- **Live URL:** <https://installer-release-doctor.sociobot.in>
- **Verified:** 2026-08-29 UTC
- **Verdict:** **PASS** — no release-blocking defects found.

## First read

A cold desktop visit answered the required questions in plain words: it checks installer releases before upload, it is for CLI authors shipping signed releases across channels, and the first action is **Try it with sample data**. The adjacent copy says that it shows a blocked release and its repair. The action opens `/demo` in one click.

## Required claim verification

`.factory/claims.json` exists and contains 24 claims. From the requested candidate after a clean `npm ci` (59 packages; audit reported 0 vulnerabilities), I ran `npm test -- --grep @claim:`. It passed every declared tagged claim in both configured browser projects (48 Playwright executions), after 9 Rust and 4 Vitest tests:

`sample-blocker`, `demo-private`, `demo-ephemeral`, `offline-demo`, `cli-local`, `json-output`, `exit-codes`, `archive-safe`, `archive-layout`, `evidence-validation`, `channel-policy-checks`, `public-key-only`, `read-only-check`, `homebrew-tap`, `windows-manifests`, `posix-installer`, `powershell-installer`, `release-checksums`, `release-identity`, `unsigned-builds`, `no-checkout`, `matrix-annotations`, `website-storage`, and `free-core`.

## Local build and CLI

- `npm test` passed: 9 Rust, 4 Vitest, and 74 Playwright tests.
- `npm run typecheck`, `npm run lint`, `npm run build`, and `cargo build --release --locked` passed. The production site was produced in `dist/site`.
- Production asset budget: JavaScript 13,811 bytes raw / 5.33 kB gzip; CSS 9,997 bytes raw / 2.83 kB gzip; mobile hero image 27,532 bytes. These are within the stated static-product budgets.
- `cargo package --locked --allow-dirty --no-verify` produced the 137.1 KiB compressed crate. I extracted it into a clean temporary consumer root and installed it with `cargo install --path`.
- The installed public CLI reports `release-doctor 0.1.3`; `--help` exposes `check` and `demo`.
- Representative end-to-end cases: a valid signed/SBOM/provenance fixture returned exit 0 with 1 ready channel; the bundled blocked sample returned exit 1 with one provenance failure and valid JSON; a missing manifest returned exit 2 with a specific recovery message.

## Live deployment, privacy, and accessibility

- Candidate deployment identity passed. Fresh candidate build and deployed resources were byte-identical: HTML `a373a9345496f9122d6f035a7efbd556ef668040d889872a82c1f98625f4542f`, JS `a589189925dbb9f0bc4530f363351f71df556cb139349059f53ed56faf0c2cd8`, CSS `4759b531738856e3b93638b4078a52f923e9ba150e87e80218ec69665e2c67d7`. The v0.1.3 release binary identifies tagged ancestor `78852b7fe04dc16a4361a0ceb284ae839ef952af`; there are no CLI, site, workflow, installer, or package-source changes from that tag through the candidate.
- `npm run test:live` passed all 6 checks. An independent route/link crawl found 200 responses for `/`, `/demo`, `/privacy`, `/terms`, the selected Linux download, and the Param Factory link; the deliberate unknown route returns the designed HTTP 404.
- A fresh `/demo` visit requested only its HTML, same-origin JS, and same-origin CSS. It set no cookies, localStorage, or sessionStorage before or after **Reset demo**. A fresh landing visit made the disclosed GitHub API request and stored only `release-cache:v2`.
- A service-worker-controlled demo used cache `release-doctor-v8`; `registration.update()` completed, and an offline reload retained the demo page. No console or page errors occurred in desktop or 390 px checks.
- Keyboard-only checks reached the skip link, banner controls, navigation, run button, repair disclosure, and footer. Enter on the landing demo action moved focus to the demo `<h1>`; Enter on the run button announced `Finished: winget is blocked by 1 missing file.` The 390 px expanded repair view had `scrollWidth === clientWidth === 390`.
- Independent `@axe-core/playwright` scans of `/demo` at 1366 px and 390 px reported zero serious or critical findings (zero findings at all). The live pages have title, language, one h1, main landmark, visible 3 px cobalt focus styling, and no observed console errors. Reduced motion completed the demo immediately.
- Response policy is appropriate: HTML revalidates/no-cache, hashed JS/CSS are `public, max-age=31536000, immutable`, and `sw.js` is no-cache. The live CSP permits only self resources plus the disclosed `https://api.github.com`, with HSTS, `nosniff`, and a strict referrer policy.

## Published release

- The v0.1.3 GitHub release exposes portable macOS (arm64/x86_64), Linux, and Windows assets plus `.deb`, `.rpm`, `.pkg`, `SHA256SUMS`, and `latest.json`.
- I downloaded `release-doctor-v0.1.3-linux-x86_64.tar.gz`; SHA-256 was `72e6bc9dba49e0ab75ad0f61f28652662bae8738dab10dc88505b34a1e5ae5eb`, matching both `SHA256SUMS` and `latest.json`. Its extracted binary reports 0.1.3.
- The page explicitly discloses that macOS and Windows artifacts are unsigned. This is a documented operator limitation, not a hidden release defect.

## Scope notes

This is a static product: it exposes no product server-side API or product-unlock endpoint and has no sign-in, so rate-limit/429 and Entra tenant checks are not applicable. No repository `verify-url.sh` was present; the equivalent live title/lang/main/alt/console checks were performed independently and `npm run test:live` passed.

## Defects

None found.

