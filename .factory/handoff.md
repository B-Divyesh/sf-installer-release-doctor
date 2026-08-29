# Installer Release Doctor — polish round 2 handoff

## Outcome

Every finding in `.factory/review-1.md` and `.factory/review-2.md` is resolved and rechecked. The repair preserves the Rust single-binary CLI, static Vite deployment, and neo-brutalist release-inspection-bench visual system.

- Work order: `installer-release-doctor-polish-2`
- Implementation commits: `efd0e2c`, `4275735`
- Deployment: `b5960aa7-1282-4439-819c-34b3aad4d784`
- Live URL: <https://installer-release-doctor.sociobot.in>
- Public release: v0.1.4 (existing binaries were not changed or republished)

## What changed

The `/?demo=1` and `/demo` routes now arrive with the Acme CLI report already complete. The first 390 × 844 screen shows the blocked winget status, missing provenance result, and **Show repair** control. The optional replay action is **Run release check again**. **Reset demo** restores this completed in-memory sample and closes opened details; **Leave demo** discards it and returns home.

Playwright invocations now use a unique process-scoped port, `--strictPort`, and `reuseExistingServer: false`. `npm run test:claims:sequential` reads `.factory/claims.json`, runs every exact command in order without retries, and can write machine-readable evidence. CI runs this sweep after the full suite.

The claims manifest, demo contract, README, copy audit, and 85-character verb-first catalog description now describe the observed behavior. `.factory/polish-2.md` maps all 36 cumulative finding IDs to changes and evidence.

## Verification

From clean no-local clone `/tmp/ird-polish2-clean-S8GQbk/repo` at `4275735af497b6b0b2b80097e989807879ea9eae`:

- `npm ci`: 59 packages, 0 vulnerabilities.
- `npm run test:claims:sequential`: all 24 exact claim commands passed consecutively in 169.7 seconds; evidence is `.factory/qa-artifacts/polish-2/clean-claim-results.json`.

From the working checkout:

- `npm run typecheck`: pass.
- `npm run lint`: pass with warnings denied.
- `npm test`: pass — 11 Rust unit, 4 Rust CLI integration, 4 Vitest, and 80 Playwright executions.
- `npm run build`: pass; output is `dist/site`.
- `cargo build --release --locked`: pass.
- `cargo package --locked --allow-dirty --no-verify`: pass; 16 files, 82.1 KiB unpacked and 22.2 KiB compressed.
- Production assets: JavaScript 15,286 bytes raw / 5.62 kB gzip; CSS 11,278 bytes raw / 3.11 kB gzip; mobile hero 27,532 bytes.
- `npm run test:live`: 6/6 pass after deployment.

The Playwright suite covers the first-screen copy at 1366 × 768 and 390 × 844; one-click sample completion; reset/exit isolation; cookies, local/session storage, and IndexedDB; same-origin demo requests; offline reload; service-worker updates; keyboard focus; reduced motion; touch targets; real routes, titles, metadata, legal links, and 404 behavior; responsive overflow; and Axe scans.

## Live evidence

The static work-order deploy command was:

```sh
/opt/fleet/lib/deploy-static.sh installer-release-doctor /work/repo/dist/site
```

Azure deployment `b5960aa7-1282-4439-819c-34b3aad4d784` succeeded and the custom domain returned HTTPS 200.

- Cold audit: `.factory/qa-artifacts/polish-2/live/audit.json`.
- First-screen screenshots: `live/cold-desktop.png`, `live/cold-mobile.png`.
- Immediate demo screenshots: `live/demo-mobile-first-screen.png`, `live/demo-mobile-repair.png`.
- Demo first-screen bounds: completed status y=510–553, blocked stamp y=583–623, blocker message y=734–784, repair control y=788–832 within 844 px.
- Demo request log stayed same-origin; cookies, localStorage, sessionStorage, and IndexedDB stayed empty before and after reset; offline reload restored the demo h1.
- Every audited route reported one h1, one main landmark, route-specific metadata, no horizontal overflow, and zero Axe violations.
- `/opt/fleet/lib/verify-url.sh`: load 594 ms; title, `lang=en`, h1, main, alt text, and button labels passed; zero console/page errors. Evidence: `live-verify/verify.json`.
- A deliberate missing route returned HTTP 404 with the designed recovery page.
- Security response headers include CSP, HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial. Evidence: `live-headers.txt`.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; FCP 0.80 s, LCP 1.65 s, TBT 0 ms, CLS 0, transfer 113,293 bytes. Evidence: `lighthouse-live.json`.
- Local and live SHA-256 values match for `index.html`, `sw.js`, `install.sh`, `install.ps1`, and `404.html`.

## Known gaps and operator action

No review finding or product defect is left open. Windows and macOS downloads remain intentionally without publisher signatures, with possible macOS ad hoc signatures, as disclosed and tested. No operator action is required for this repair.
