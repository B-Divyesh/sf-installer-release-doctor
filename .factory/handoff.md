# Installer Release Doctor — repair 8 handoff

## Outcome

**PASS.** The sole release blocker from independent verification 10 is repaired and the static site is deployed at <https://installer-release-doctor.sociobot.in>.

- Work order: `installer-release-doctor-repair-8`
- Base candidate that failed: `bd548deb21942910c639fb3e2c71ca5153e4235f`
- Repair commits: `c0f58f2` and `00bef62`
- Static deployment: `a15a1d8f-6c0d-4d75-9d48-12086b69b0f4`
- Artifact and deployment class: Rust CLI installers plus static landing/docs site; unchanged.

## What was repaired

Every exact command in `.factory/claims.json` is `npm test -- --grep @claim:<id>`. On a clean clone, that command previously ran the Rust suite and then exited 127 because the locked `vitest` executable was absent.

`pretest` now runs `scripts/ensure-test-deps.mjs`. It checks for the lockfile-installed Vitest, Vite, and Playwright entry points and runs `npm ci --no-audit --no-fund` only when that complete web test toolchain is missing. The normal test then continues unchanged.

`npm run test:claims:clean` is exact regression coverage: it creates a new `git clone --no-local`, proves it has no `node_modules`, runs the recorded `npm test -- --grep @claim:sample-blocker` command, and proves the complete locked toolchain was installed. CI runs that regression after provisioning Chromium, before its normal full suite. No CLI, installer, release, user-facing site behavior, researched brief, or existing passing claim was changed.

## Verification

- Reproduced the verifier's representative clean-clone failure at the base candidate: `npm test -- --grep @claim:sample-blocker` exited 127 at `vitest: not found`.
- From a new clean clone of repair `c0f58f2`, all **24/24** exact recorded claim commands passed consecutively in **182.3 seconds**. The first command performed the locked install; every subsequent command reached its tagged assertion. Evidence: `.factory/qa-artifacts/repair-8/clean-claim-results.json`.
- At final repair `00bef62`, `npm run test:claims:clean` passed from another clean clone, including Rust unit/integration, Vitest, production build, and desktop + 390 px sample-claim browser runs.
- `npm ci` passed: 59 packages, 0 vulnerabilities.
- `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` passed. The full test suite ran 11 Rust unit tests, 4 Rust CLI integration tests, 4 Vitest tests, and 80 desktop/390 px Playwright executions.
- `cargo build --release --locked` and `cargo package --locked --allow-dirty` passed; the crate contains 16 files (82.1 KiB unpacked, 22.2 KiB compressed).
- A consumer installed the packaged crate with `cargo install --path target/package/installer-release-doctor-0.1.4 --root <temp>`; `--version` returned `0.1.4`, `demo --format json` found the provenance blocker and exited 1, and missing input exited 2 with the corrective message.
- The full Playwright suite covers desktop and 390 px mobile, keyboard entry/reset and the skip link, touch targets, routes/metadata/404, Axe scans, privacy storage/request boundaries, offline demo reload, service-worker update, reduced motion, release and installer claims, and response configuration. Axe found no serious or critical issues.
- Local `verify-url.sh` passed with zero page/console errors, `lang=en`, one h1, one main landmark, complete image alt text, and named buttons. Evidence: `.factory/qa-artifacts/repair-8/verify-url/verify.json`.
- Local mobile Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; FCP 1.0 s, LCP 1.7 s, TBT 70 ms, CLS 0. Evidence: `.factory/qa-artifacts/repair-8/lighthouse-local-mobile.json`.

## Deployed verification

- `npm run test:live`: 6/6 passed on the deployed site, covering response policy, 404, keyboard, and serious/critical Axe findings at desktop and 390 px.
- Hosted `verify-url.sh` passed in 850 ms with zero console/page errors and complete baseline semantics. Evidence: `.factory/qa-artifacts/repair-8/live-verify/verify.json`.
- Hosted mobile Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; FCP 0.8 s, LCP 1.66 s, TBT 0 ms, CLS 0. Evidence: `.factory/qa-artifacts/repair-8/lighthouse-live-mobile.json`.
- The live response sends CSP restricted to self plus the documented `https://api.github.com` connection, HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation denial. Evidence: `.factory/qa-artifacts/repair-8/live-headers.txt`.
- SHA-256 checks verified all 11 published static files that should be served (HTML, service worker, installers, site assets, icons, robots, and sitemap) match this deployed build byte-for-byte.
- Live release identity remains valid: GitHub release `v0.1.4`, manifest version `0.1.4`, source commit `9fb117f543101d86f725c0f5fffaeabeaa33b834`, and the published Linux archive matches `SHA256SUMS`.

## Run, test, and deploy

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run test:claims:clean
npm run test:claims:sequential
npm run build
cargo build --release --locked
cargo package --locked --allow-dirty
/opt/fleet/lib/deploy-static.sh installer-release-doctor /work/repo/dist/site
```

## Known gaps / operator action

None for this repair. Existing public Windows and macOS downloads remain intentionally unsigned as documented and tested; release `v0.1.4` binaries were not changed or republished because this repair only changes the repository test bootstrap and CI regression coverage. The product has no product API, billing flow, or sign-in, so API allowance/429 and Entra checks do not apply.
