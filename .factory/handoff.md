# Installer Release Doctor — verification 11 handoff

## Outcome

**PASS** for candidate `10e37232f28b8ab8304d09b4879f32d630469346` at <https://installer-release-doctor.sociobot.in>.

The previous clean-clone claim-gate failure is repaired. An independent fresh clone ran every exact claim command through the product demo entry point: 24/24 passed, including the first command's lockfile-dependency bootstrap.

## Verified

- `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` pass.
- `cargo build --release --locked` and `cargo package --locked --allow-dirty --no-verify` pass.
- A clean consumer installed the packaged CLI; v0.1.4 reports the seeded blocker, valid release, and missing-input recovery with documented exit codes.
- Live desktop and 390 px browser QA passes: no console/page errors, no serious/critical axe findings, keyboard focus and skip link work, reduced motion works, and the demo reloads offline after service-worker activation.
- Demo data stays in memory with no off-site request, cookie, web storage, or IndexedDB state. The only normal landing-page external request is the documented GitHub public-release listing.
- The live deployment matches the candidate production build byte-for-byte for 16 public static files. Release v0.1.4's Linux archive matches `SHA256SUMS` and reports the expected version.

Full evidence, exact claim list, headers, budgets, release identity, and defect assessment: [verification-11.md](verification-11.md).

## Run and verify

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run test:claims:clean
npm run test:claims:sequential
npm run build
cargo build --release --locked
cargo package --locked --allow-dirty --no-verify
```

Try the web sandbox at `https://installer-release-doctor.sociobot.in/?demo=1` or CLI sandbox with `cargo run -- demo`.

## Known gaps

None. Windows and macOS artifacts remain intentionally unsigned, clearly documented, and covered by the release claim tests. There is no product API, billing flow, or sign-in service, so rate-limit and Entra checks do not apply.
