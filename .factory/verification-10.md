# Independent verification 10 — FAIL

- **Candidate:** `bd548deb21942910c639fb3e2c71ca5153e4235f` (`main`)
- **Live URL:** <https://installer-release-doctor.sociobot.in>
- **Verified:** 2026-08-29 UTC
- **Result:** **FAIL** — the mandatory clean-clone claim gate fails before dependency installation.

## Release-blocking finding

### High — every declared claim command exits 127 in a clean clone

`.factory/claims.json` exists and contains 24 claims. Before installing dependencies, I ran every recorded `npm test -- --grep @claim:<id>` command at the candidate commit. All 24 commands reached the Rust suites, then stopped at `npm run test:unit` with:

```text
> vitest run --config site/vitest.config.ts
sh: 1: vitest: not found
```

Each exact command exited 127, so none reached its tagged Playwright assertion. The same result was reproduced in a second isolated clone with no `node_modules`; machine-readable evidence is in `.factory/qa-artifacts/verification-10/claims-before-install.json`. The work order explicitly says any failing claim test is release-blocking, so this determines the overall result.

After `npm ci`, the repository's sequential runner executed the same 24 commands and all passed. That confirms the blocker is test bootstrap from the required clean state, not a false product assertion. Evidence: `.factory/qa-artifacts/verification-10/claims-after-install.json`.

Recommended repair: make the mandatory claim-gate entry point install its locked dependencies, or define and enforce dependency installation as part of the claim command itself, then rerun all 24 commands from a new clean clone.

## Cold first read — PASS

The cold desktop first screen says **“Check installer releases before upload.”** It identifies the audience as CLI authors checking archives and release evidence before publishing installers. The visible first action is **“Try it with sample data”**, with the adjacent explanation **“See one blocked release and its repair.”** This answers what it does, whom it is for, and what to click first in plain words.

Activating that link once opens `/?demo=1` with the completed Acme CLI report. At 390 × 844, the blocked winget state, missing provenance message, and **Show repair** control are visible without another action. The persistent banner says sample data is not saved and offers reset and exit controls.

## Claims after dependency installation

After `npm ci`, all 24 exact claim commands passed: `sample-blocker`, `demo-private`, `demo-ephemeral`, `offline-demo`, `cli-local`, `json-output`, `exit-codes`, `archive-safe`, `archive-layout`, `evidence-validation`, `channel-policy-checks`, `public-key-only`, `read-only-check`, `homebrew-tap`, `windows-manifests`, `posix-installer`, `powershell-installer`, `release-checksums`, `release-identity`, `unsigned-builds`, `no-checkout`, `matrix-annotations`, `website-storage`, and `free-core`.

## Local, package, and CLI evidence

- `npm ci`: pass; 59 packages installed and 0 vulnerabilities reported.
- `npm test`: pass; 11 Rust unit tests, 4 Rust public-CLI integration tests, 4 Vitest tests, and 80 Playwright executions.
- `npm run typecheck`: pass.
- `npm run lint`: pass (`cargo fmt --check`; locked Clippy with warnings denied).
- `npm run build`: pass; output produced in `dist/site`.
- `cargo build --release --locked`: pass.
- `cargo package --locked --allow-dirty`: pass; 16 files, 82.1 KiB unpacked / 22.2 KiB compressed.
- Clean consumer: the packaged crate installed with `cargo install --path`; `--version` returned `0.1.4`; `demo --format json` returned the expected provenance blocker and exit 1; missing input returned exit 2 with a corrective message.
- Direct boundaries: empty channels and malformed YAML returned exit 2; invalid reverse-DNS identifiers were rejected; prerelease-to-final and maximum SemVer component upgrades were accepted; a drive-qualified ZIP entry was rejected; an opaque MSI produced warnings and returned 0 normally / 1 under `--strict`.

## Live deployment evidence

- `npm run test:live`: pass, 6/6 across desktop and 390 px projects.
- `/opt/fleet/lib/verify-url.sh`: pass; HTTP 200, correct title, `lang=en`, one h1, main landmark, alt text, labels, and zero home-page console errors. Evidence: `.factory/qa-artifacts/verification-10/verify-url/verify.json`.
- Axe: zero serious or critical findings on home, demo, privacy, terms, and the designed 404 page at desktop and 390 px.
- Keyboard: skip link is first, visible at `(8, 8)`, and has a 3 px cobalt focus outline. The sample link activates with Enter; route focus moves to the demo h1; replay/reset work without a trap.
- Responsive behavior: no horizontal overflow at desktop or 390 px; all visible controls measured at least 44 × 44 CSS px. A 200% visual zoom retained all content and controls, with horizontal scrolling available for the terminal-style wide content.
- Reduced motion: nontrivial animation and transition durations are suppressed; the completed result appears immediately.
- Privacy: the demo flow requested only same-origin documents/assets. It sent no sample data off-site and set no cookies, session storage, or IndexedDB. The only localStorage key was the documented `release-cache:v2` cache for GitHub's public release listing.
- PWA: service worker `release-doctor-v9` activated, an explicit update check completed with no waiting worker, and the demo reloaded successfully offline.
- Headers: CSP allows only self plus the documented GitHub API connection and sends `frame-ancestors 'none'`; HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial are present. HTML is revalidated; hashed JS/CSS are cached for one year as immutable.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; FCP 825 ms, LCP 1,382 ms, TBT 137 ms, CLS 0. Evidence: `.factory/qa-artifacts/verification-10/lighthouse-mobile.json`.
- Budgets: initial JS 15,286 bytes raw / 5,646 bytes gzip; CSS 11,278 bytes raw / 3,125 bytes gzip; mobile hero 27,532 bytes.
- Internal-link crawl: all home, demo, privacy, terms, and fragment targets returned 200; the unknown path returned the designed document with HTTP 404.

## Deployment and release identity

The live `index.html`, hashed JS, hashed CSS, service worker, both installer scripts, both hero images, terminal SVG, 404 assets, robots, sitemap, favicon, and touch icon match the candidate build byte-for-byte by SHA-256. The static deployment therefore matches the tested candidate.

The public release is `v0.1.4`. Its `latest.json` identifies tag source `9fb117f543101d86f725c0f5fffaeabeaa33b834`; the candidate does not change Rust CLI source after that tag. The candidate's GitHub Actions run `33249322898` passed `test`, `windows-installer`, and `macos-signatures`.

The hosted POSIX installer ran in an isolated install directory, verified the download, installed v0.1.4, and ran the demo. The independently downloaded Linux archive was 767,930 bytes, matched SHA-256 `70fc2de3fb3f3388845da1f7311f9f964776a86fef8e8e4b7b28bc69ef5e04f2`, and reported v0.1.4.

This is a static site plus local CLI. It has no product server-side endpoint, billing/unlock call, or sign-in flow, so API allowance/429 and Microsoft Entra checks are not applicable. Deterministic local policy checking does not have an obvious AI-assisted step that would improve this brief without weakening privacy or repeatability.

## Defects by severity

- **High / release-blocking:** all 24 required claim commands exit 127 from a clean clone before dependencies are installed.
- **Medium:** none found.
- **Low:** none found.
