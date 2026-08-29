# Independent verification 11 — PASS

- **Candidate:** `10e37232f28b8ab8304d09b4879f32d630469346`
- **Live URL:** <https://installer-release-doctor.sociobot.in>
- **Verified:** 2026-08-29 UTC
- **Result:** **PASS**

The previous deployment-only concern is not reproduced. The live static files match a fresh production build of this candidate, and all required local, clean-clone, packaged-CLI, and live-browser checks passed.

## Mandatory first checks

### Claims — PASS (24/24)

I created a new dependency-free clone at the candidate commit and ran `npm run test:claims:sequential`. That runner invokes every exact `test` command recorded in `.factory/claims.json`: `npm test -- --grep @claim:<id>`. The first invocation used the product's `pretest` entry point to install the lockfile-defined web test dependencies; no dependency setup was done in the fresh clone beforehand. All 24 commands passed in 308.1 seconds with zero failures:

`sample-blocker`, `demo-private`, `demo-ephemeral`, `offline-demo`, `cli-local`, `json-output`, `exit-codes`, `archive-safe`, `archive-layout`, `evidence-validation`, `channel-policy-checks`, `public-key-only`, `read-only-check`, `homebrew-tap`, `windows-manifests`, `posix-installer`, `powershell-installer`, `release-checksums`, `release-identity`, `unsigned-builds`, `no-checkout`, `matrix-annotations`, `website-storage`, and `free-core`.

This directly verifies the repair for verification 10's clean-clone `vitest: not found` failure. `claims.json` exists and each claim had a passing tagged demo-entry-point test.

### Cold first read — PASS

On a cold 390 px visit, the first screen says **“Check installer releases before upload.”** It says this is **“For CLI authors checking archives and release evidence before publishing installers.”** The first action is **“Try it with sample data”** and explains **“See one blocked release and its repair.”** It answers what the product does, who it is for, and what to click first in plain words.

One activation opens the completed Acme CLI report. The 390 px first screen shows the blocked winget state, missing provenance finding, and **Show repair** control. The persistent demo banner says **“sample data, nothing is saved”** and provides Reset demo and Leave demo.

## Local quality and product exercise — PASS

- `npm ci`: passed; 59 packages installed, zero reported vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: passed (`cargo fmt --check` and locked Clippy with warnings denied).
- `npm test`: passed: 11 Rust unit tests, 4 Rust public-CLI integration tests, 4 Vitest tests, and 80 Playwright executions.
- `npm run build`: passed and produced `dist/site`.
- `cargo build --release --locked`: passed.
- `cargo package --locked --allow-dirty --no-verify`: passed.

I installed the packaged crate into an isolated consumer root with `cargo install --path`. The installed public binary reported `release-doctor 0.1.4`; `demo --format json` returned the seeded provenance blocker (exit 1, policy `2026-08-01`), and an absent manifest returned exit 2 with the documented corrective message.

End-to-end with the release binary, a complete sample release with the in-toto companion passed with 1 ready channel and zero findings. The bundled demo produced 1 blocker and exit 1. Missing input recovered with exit 2 and `Pass --manifest with a YAML or JSON file.` The claim suite additionally exercised unsafe ZIP/tar/tar.gz paths, malformed and mismatched evidence, invalid package metadata and SemVer boundaries, read-only input behavior, and strict opaque-format warnings.

## Live deployment and browser QA — PASS

- `npm run test:live`: 6/6 passed across desktop and 390 px mobile.
- `/opt/fleet/lib/verify-url.sh https://installer-release-doctor.sociobot.in`: HTTP 200, `lang=en`, title, one h1, main landmark, image alt text, named controls, and no console errors.
- Independent Playwright + axe audit found zero serious/critical violations on desktop home/privacy and 390 px home/terms/demo. There was no horizontal overflow in any tested viewport.
- Keyboard: Tab lands first on the skip link; its visible ring is `rgb(36, 71, 255) solid 3px` with a 3 px offset. Enter on the sample link moves focus to the demo h1. Enter on the replay control returns focus to that control after completion. No trap was found.
- Reduced motion: the replay result completed in 129 ms with `prefers-reduced-motion: reduce`.
- PWA: after service-worker control, `/demo` reloaded offline with HTTP 200 and the sample heading present.
- Live link crawl: all internal URLs, the download, GitHub release, and Param Factory link returned successful responses.

## Privacy, headers, budgets, and deployment identity — PASS

- A cold home visit made only the documented `https://api.github.com` request, used to list public release metadata. Privacy and terms made no off-site request. The full demo flow made no off-site request.
- In a fresh demo context, before interaction and after reset, cookies, localStorage, sessionStorage, and IndexedDB were all empty. The normal home path uses only its documented `release-cache:v2` public-release cache.
- The live CSP is `default-src 'self'` with only `https://api.github.com` in `connect-src`, plus response-header `frame-ancestors 'none'`. HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial are present.
- HTML and service worker are `no-cache`; hashed JS/CSS are `public, max-age=31536000, immutable`.
- Fresh production build: JS is 15,286 bytes raw / 5,646 bytes gzip; CSS is 11,278 bytes raw / 3,125 bytes gzip; mobile hero is 27,532 bytes. All are within the stated budgets.
- Mobile Lighthouse: performance 95, accessibility 100, best practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 270 ms, CLS 0.
- SHA-256 matched all 16 publicly served candidate static files checked (HTML, service worker, installers, routes/assets, icons, hero and OG art) against the fresh `dist/site` build.
- Release `v0.1.4` has valid `SHA256SUMS`; the downloaded 767,930-byte Linux archive matched `70fc2de3fb3f3388845da1f7311f9f964776a86fef8e8e4b7b28bc69ef5e04f2` and reports v0.1.4. `latest.json` identifies source `9fb117f543101d86f725c0f5fffaeabeaa33b834`; there is no Rust CLI change between that release source and this candidate.

This static-site/local-CLI product has no product server-side endpoint, sign-in, billing/unlock request, or other API for which an allowance/429 test applies. It uses no AI feature, which is appropriate for deterministic local artifact validation.

## Defects by severity

- **Critical:** none.
- **High:** none.
- **Medium:** none.
- **Low:** none.
