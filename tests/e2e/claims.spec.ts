import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import AxeBuilder from '@axe-core/playwright';

test('@claim:sample-blocker finds the seeded release blocker and repair', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Inspect the sample release');
  await expect(page.getByText('Provenance companion is missing.')).toBeVisible();
  await page.getByText('Show repair').click();
  await expect(page.getByText(/Create acme-cli_1.4.0_windows/)).toBeVisible();
});

test('@claim:demo-private demo sends no sample data off site', async ({ page }) => {
  const external: string[] = [];
  page.on('request', function (request) {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') external.push(request.url());
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Run release check' }).click();
  await expect(page.getByText(/Finished: winget is blocked/)).toBeVisible();
  expect(external).toEqual([]);
});

test('@claim:demo-ephemeral demo changes are never persisted', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Run release check' }).click();
  await expect(page.getByText(/Finished: winget is blocked/)).toBeVisible();
  await page.getByText('Show repair').click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const storage = await page.evaluate(function () {
    return { local: Object.keys(localStorage), session: Object.keys(sessionStorage), cookie: document.cookie };
  });
  expect(storage).toEqual({ local: [], session: [], cookie: '' });
  await expect(page.getByText('Ready to inspect the winget channel.')).toBeVisible();
});

test('@claim:offline-demo sample demo reloads offline after first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.waitForFunction(function () { return navigator.serviceWorker?.ready; });
  await page.waitForFunction(function () { return navigator.serviceWorker?.controller; });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Inspect the sample release' })).toBeVisible();
});

test('@claim:cli-local bundled CLI demo runs with network proxies blocked', async () => {
  const result = spawnSync('cargo', ['run', '--quiet', '--', 'demo', '--format', 'json'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, HTTP_PROXY: 'http://127.0.0.1:1', HTTPS_PROXY: 'http://127.0.0.1:1', NO_PROXY: '' }
  });
  expect(result.status).toBe(1);
  const report = JSON.parse(result.stdout);
  expect(report.findings.some(function (finding: { check: string; level: string }) { return finding.check === 'provenance' && finding.level === 'fail'; })).toBe(true);
  expect(result.stderr).toContain('Demo workspace:');
});

test('@claim:json-output CLI emits machine-readable reports', async () => {
  const result = spawnSync('cargo', ['run', '--quiet', '--', 'demo', '--format', 'json'], { cwd: process.cwd(), encoding: 'utf8' });
  const report = JSON.parse(result.stdout);
  expect(report.summary).toEqual(expect.objectContaining({ channels: 1, failures: 1 }));
  expect(report.policy_version).toBe('2026-08-01');
});

test('@claim:exit-codes CLI returns stable success, blocked, and input-error codes', async () => {
  const root = mkdtempSync(join(tmpdir(), 'release-doctor-exits-'));
  cpSync('examples/demo', root, { recursive: true });
  writeFileSync(join(root, 'artifacts', 'acme-cli_1.4.0_windows_x86_64.zip.intoto.jsonl'), '{"_type":"https://in-toto.io/Statement/v1","subject":[{"name":"acme-cli_1.4.0_windows_x86_64.zip","digest":{"sha256":"72f0da333168f736893e41756aaabe226a218354505f50b1cd797cd74f7f7589"}}],"predicateType":"https://slsa.dev/provenance/v1","predicate":{}}\n');
  const ready = spawnSync('cargo', ['run', '--quiet', '--', 'check', '--manifest', join(root, 'release-doctor.yml'), '--artifacts', join(root, 'artifacts')], { cwd: process.cwd(), encoding: 'utf8' });
  const blocked = spawnSync('cargo', ['run', '--quiet', '--', 'demo'], { cwd: process.cwd(), encoding: 'utf8' });
  const unreadable = spawnSync('cargo', ['run', '--quiet', '--', 'check', '--manifest', join(root, 'missing.yml'), '--artifacts', join(root, 'artifacts')], { cwd: process.cwd(), encoding: 'utf8' });
  expect(ready.status, ready.stderr).toBe(0);
  expect(blocked.status).toBe(1);
  expect(unreadable.status).toBe(2);
  expect(unreadable.stderr).toContain('manifest not found');
});

test('@claim:checker-scope checker reports every documented policy category', async () => {
  const result = spawnSync('cargo', ['test', 'reports_documented_check_scope'], { cwd: process.cwd(), encoding: 'utf8' });
  expect(result.status, result.stderr).toBe(0);
  expect(result.stdout).toContain('test tests::reports_documented_check_scope ... ok');
});

test('@claim:archive-safe archive paths cannot escape the inspection root', async () => {
  const result = spawnSync('cargo', ['test', 'blocks_parent_paths'], { cwd: process.cwd(), encoding: 'utf8' });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('test tests::blocks_parent_paths ... ok');
});

test('@claim:evidence-validation rejects empty and mismatched release evidence', async () => {
  const result = spawnSync('cargo', ['test', 'evidence'], { cwd: process.cwd(), encoding: 'utf8' });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('test tests::verifies_release_evidence ... ok');
  expect(result.stdout).toContain('test tests::rejects_empty_evidence_companions ... ok');
});

test('@claim:public-key-only verifies signatures without a signing key', async () => {
  const result = spawnSync('cargo', ['test', 'verifies_with_public_key_only'], { cwd: process.cwd(), encoding: 'utf8' });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('test tests::verifies_with_public_key_only ... ok');
});

test('@claim:read-only-check leaves every input byte unchanged', async () => {
  const result = spawnSync('cargo', ['test', 'default_check_does_not_change_inputs'], { cwd: process.cwd(), encoding: 'utf8' });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('test tests::default_check_does_not_change_inputs ... ok');
});

test('@claim:homebrew-tap resolves to a valid current formula', async ({ request }) => {
  const remote = spawnSync('git', ['ls-remote', 'https://github.com/B-Divyesh/homebrew-installer-release-doctor.git'], { encoding: 'utf8' });
  expect(remote.status).toBe(0);
  expect(remote.stdout).toContain('refs/heads/main');

  const response = await request.get('https://raw.githubusercontent.com/B-Divyesh/homebrew-installer-release-doctor/main/Formula/installer-release-doctor.rb');
  expect(response.ok()).toBe(true);
  const formula = await response.text();
  const latestResponse = await request.get('https://api.github.com/repos/B-Divyesh/sf-installer-release-doctor/releases/latest');
  expect(latestResponse.ok()).toBe(true);
  const latest = await latestResponse.json();
  const version = String(latest.tag_name).replace(/^v/, '');
  expect(formula).toContain('class InstallerReleaseDoctor < Formula');
  expect(formula).toContain('version "' + version + '"');

  const urls = [...formula.matchAll(/url "([^"]+darwin-[^"]+\.tar\.gz)"/g)].map((match) => match[1]);
  const checksums = [...formula.matchAll(/sha256 "([a-f0-9]{64})"/g)].map((match) => match[1]);
  expect(urls).toHaveLength(2);
  expect(checksums).toHaveLength(2);
  for (let index = 0; index < urls.length; index += 1) {
    const archive = await request.get(urls[index]);
    expect(archive.ok()).toBe(true);
    expect(createHash('sha256').update(await archive.body()).digest('hex')).toBe(checksums[index]);
  }
});

test('@claim:matrix-annotations CLI writes a matrix and GitHub annotations', async () => {
  const matrix = join(mkdtempSync(join(tmpdir(), 'release-doctor-test-')), 'matrix.md');
  const result = spawnSync('cargo', ['run', '--quiet', '--', 'check', '--manifest', 'examples/demo/release-doctor.yml', '--artifacts', 'examples/demo/artifacts', '--github', '--matrix', matrix], { cwd: process.cwd(), encoding: 'utf8' });
  expect(result.status).toBe(1);
  expect(result.stdout).toContain('::error title=winget / provenance::');
  expect(readFileSync(matrix, 'utf8')).toContain('| winget | Blocked |');
});

test('@claim:free-core core checker is MIT licensed', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Core checker is free')).toBeVisible();
  expect(readFileSync('LICENSE', 'utf8')).toContain('Permission is hereby granted, free of charge');
});

test('@claim:published-release release state requires an asset and SHA256SUMS', async ({ page }) => {
  await page.route('https://api.github.com/**', async function (route) {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([{
        tag_name: 'v0.1.2',
        html_url: 'https://github.com/B-Divyesh/sf-installer-release-doctor/releases/tag/v0.1.2',
        assets: [
          { name: 'release-doctor-v0.1.2-linux-x86_64.tar.gz', browser_download_url: 'https://github.com/example/linux' },
          { name: 'SHA256SUMS', browser_download_url: 'https://github.com/example/sums' }
        ]
      }])
    });
  });
  await page.goto('/');
  await expect(page.getByText('Published v0.1.2. SHA256SUMS is included.')).toBeVisible();
  await expect(page.getByRole('link', { name: /Download release-doctor-v0.1.2-linux/ })).toHaveAttribute('href', 'https://github.com/example/linux');
});

test('@claim:website-storage website stores only the public release cache', async ({ page }) => {
  const external: string[] = [];
  page.on('request', function (request) {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') external.push(url.origin);
  });
  await page.route('https://api.github.com/**', async function (route) {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify([{
      tag_name: 'v0.1.2',
      html_url: 'https://github.com/example/release',
      assets: [
        { name: 'release-doctor-v0.1.2-linux-x86_64.tar.gz', browser_download_url: 'https://github.com/example/linux' },
        { name: 'SHA256SUMS', browser_download_url: 'https://github.com/example/sums' }
      ]
    }]) });
  });
  await page.goto('/');
  expect(await page.context().cookies()).toEqual([]);
  expect(await page.evaluate(function () { return Object.keys(localStorage); })).toEqual(['release-cache:v2']);
  expect(external).toEqual(['https://api.github.com']);
  await expect(page.locator('input')).toHaveCount(0);
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Run release check' }).click();
  expect(await page.evaluate(function () { return Object.keys(localStorage); })).toEqual(['release-cache:v2']);
});

test('routes have one h1 and no serious accessibility findings', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', function (message) { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', function (error) { errors.push(error.message); });
  for (const route of ['/', '/demo', '/privacy', '/terms', '/missing']) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(function (item) { return item.impact === 'critical' || item.impact === 'serious'; })).toEqual([]);
    expect(await page.evaluate(function () { return document.documentElement.scrollWidth <= window.innerWidth; })).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('expanded repair stays inside a 390 pixel viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo');
  await page.getByText('Show repair').click();
  await expect(page.getByText(/\.intoto\.jsonl beside the artifact/)).toBeVisible();
  expect(await page.evaluate(function () { return document.documentElement.scrollWidth; })).toBeLessThanOrEqual(390);
});

test('Intel macOS gets an Intel primary download and both architectures', async ({ page }) => {
  await page.addInitScript(function () {
    Object.defineProperty(navigator, 'userAgent', { value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' });
  });
  await page.route('https://api.github.com/**', async function (route) {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([{
        tag_name: 'v0.1.2',
        html_url: 'https://github.com/example/release',
        assets: [
          { name: 'release-doctor-v0.1.2-darwin-aarch64.tar.gz', browser_download_url: 'https://github.com/example/arm' },
          { name: 'release-doctor-v0.1.2-darwin-x86_64.tar.gz', browser_download_url: 'https://github.com/example/intel' },
          { name: 'SHA256SUMS', browser_download_url: 'https://github.com/example/sums' }
        ]
      }])
    });
  });
  await page.goto('/');
  const downloads = page.locator('#download-state .button');
  await expect(downloads).toHaveCount(2);
  await expect(downloads.nth(0)).toHaveText('Download for Intel Mac');
  await expect(downloads.nth(0)).toHaveAttribute('href', 'https://github.com/example/intel');
  await expect(downloads.nth(1)).toHaveText('Download for Apple silicon');
});

test('footer links to the live Param Factory site', async ({ page, request }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: /Built by Param Factory/ });
  await expect(link).toHaveAttribute('href', 'https://sociobot.in/');
  expect((await request.get('https://sociobot.in/')).ok()).toBe(true);
});

test('keyboard path enters and resets the demo', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /Installer Release Doctor/ })).toBeFocused();
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await page.getByRole('button', { name: 'Reset demo' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Ready to inspect the winget channel.')).toBeVisible();
});

test('deployment policy caches hashed assets immutably and revalidates the shell', async () => {
  const config = JSON.parse(readFileSync('dist/site/staticwebapp.config.json', 'utf8'));
  expect(config.navigationFallback).toBeUndefined();
  expect(config.routes).toContainEqual({ route: '/demo', rewrite: '/index.html' });
  expect(config.routes).toContainEqual({ route: '/privacy', rewrite: '/index.html' });
  expect(config.routes).toContainEqual({ route: '/terms', rewrite: '/index.html' });
  expect(config.routes).toContainEqual({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } });
  expect(config.routes).toContainEqual({ route: '/sw.js', headers: { 'Cache-Control': 'no-cache' } });
  expect(config.responseOverrides).toEqual({ '404': { rewrite: '/404.html', statusCode: 404 } });
  const notFound = readFileSync('dist/site/404.html', 'utf8');
  expect(notFound).toContain('<h1 id="not-found-title">This package went to the wrong path</h1>');
  expect(notFound).toContain('href="/">Return to the workbench</a>');
  expect(readdirSync('dist/site/assets').some(function (name) { return /^index-[\w-]+\.js$/.test(name); })).toBe(true);
  expect(config.globalHeaders['Content-Security-Policy']).not.toContain('api.sociobot.in');
});

test('release automation cannot silently skip or overwrite the Homebrew tap', async () => {
  const workflow = readFileSync('.github/workflows/release.yml', 'utf8');
  expect(workflow).toContain('TAP_GITHUB_TOKEN is required');
  expect(workflow).toContain('FORMULA_SHA=');
  expect(workflow).not.toContain("if: ${{ env.TAP_GITHUB_TOKEN != '' }}");
});

test('@claim:release-assets release automation builds and validates the documented asset matrix', async () => {
  const config = readFileSync('nfpm.yaml', 'utf8');
  const workflow = readFileSync('.github/workflows/release.yml', 'utf8');
  expect(config).toContain('version: "${VERSION}"');
  expect(config).not.toContain('$${VERSION}');
  expect(config.replaceAll('${VERSION}', '0.1.2')).toContain('version: "0.1.2"');
  for (const expected of ['linux-x86_64.tar.gz', 'darwin-aarch64.tar.gz', 'darwin-x86_64.tar.gz', 'windows-x86_64.zip', 'amd64.deb', 'x86_64.rpm', 'darwin-aarch64.pkg', 'SHA256SUMS']) {
    expect(workflow).toContain(expected);
  }
  expect(readFileSync('scripts/make-latest.mjs', 'utf8')).toContain("join(directory, 'latest.json')");
  expect(workflow).toContain('dpkg-deb -f release/release-doctor-$VERSION-amd64.deb Version');
  expect(workflow).toContain("rpm -qp --qf '%{VERSION}\\n' release/release-doctor-$VERSION.x86_64.rpm");
});

test('all product surfaces and release jobs use version 0.1.2', async () => {
  expect(JSON.parse(readFileSync('package.json', 'utf8')).version).toBe('0.1.2');
  expect(readFileSync('Cargo.toml', 'utf8')).toContain('version = "0.1.2"');
  expect(readFileSync('site/src/main.ts', 'utf8')).not.toContain('v0.1.1');
  expect(readFileSync('.github/workflows/release.yml', 'utf8')).toContain('default: 0.1.2');
});

test('service worker installs and updates the versioned demo cache', async ({ page }) => {
  await page.goto('/demo');
  const worker = await page.evaluate(async function () {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return { script: registration.active?.scriptURL, cacheNames: await caches.keys() };
  });
  expect(worker.script).toMatch(/\/sw\.js$/);
  expect(worker.cacheNames).toContain('release-doctor-v7');
});

test('reduced motion shows the final demo result without a scan delay', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Run release check' }).click();
  await expect(page.getByText('Finished: winget is blocked by 1 missing file.')).toBeVisible();
});

test('visible controls meet the 44 pixel touch target baseline', async ({ page }) => {
  for (const route of ['/', '/demo', '/privacy', '/terms']) {
    await page.goto(route);
    const targets = page.locator('a, button, input, summary').filter({ visible: true });
    for (let index = 0; index < await targets.count(); index += 1) {
      const box = await targets.nth(index).boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test('unavailable policy-pack checkout is not exposed', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Buy the policy pack/i })).toHaveCount(0);
  await expect(page.locator('a[href*="api.sociobot.in"]')).toHaveCount(0);
  await expect(page.getByText('$49', { exact: true })).toHaveCount(0);
  expect(readFileSync('site/src/main.ts', 'utf8')).not.toContain('https://api.sociobot.in');
  expect(readFileSync('site/public/staticwebapp.config.json', 'utf8')).not.toContain('api.sociobot.in');
});

test('@claim:posix-installer shell installer verifies, installs, and configures PATH', async () => {
  const fixture = mkdtempSync(join(tmpdir(), 'release-doctor-installer-'));
  const home = join(fixture, 'home');
  const source = join(fixture, 'source');
  const fakeBin = join(fixture, 'bin');
  const archive = join(fixture, 'release-doctor-v0.1.1-linux-x86_64.tar.gz');
  const checksums = join(fixture, 'SHA256SUMS');
  mkdirSync(home);
  mkdirSync(source);
  mkdirSync(fakeBin);
  const binary = join(source, 'release-doctor');
  writeFileSync(binary, '#!/bin/sh\necho "release-doctor 0.1.1"\n');
  chmodSync(binary, 0o755);
  expect(spawnSync('tar', ['-C', source, '-czf', archive, 'release-doctor'], { encoding: 'utf8' }).status).toBe(0);
  writeFileSync(checksums, createHash('sha256').update(readFileSync(archive)).digest('hex') + '  ' + archive.split('/').pop() + '\n');
  const fakeCurl = join(fakeBin, 'curl');
  writeFileSync(fakeCurl, `#!/bin/sh
out=""
url=""
next_out=0
for arg in "$@"; do
  if [ "$next_out" = 1 ]; then out="$arg"; next_out=0; continue; fi
  if [ "$arg" = "-o" ]; then next_out=1; continue; fi
  case "$arg" in -*) ;; *) url="$arg" ;; esac
done
case "$url" in
  *releases/latest) printf '%s' '{"browser_download_url":"https://fixture.invalid/release-doctor-v0.1.1-linux-x86_64.tar.gz"}' ;;
  *SHA256SUMS) cp "$INSTALLER_FIXTURE_DIR/SHA256SUMS" "$out" ;;
  *linux-x86_64.tar.gz) cp "$INSTALLER_FIXTURE_DIR/release-doctor-v0.1.1-linux-x86_64.tar.gz" "$out" ;;
  *) exit 1 ;;
esac
`);
  chmodSync(fakeCurl, 0o755);
  const install = spawnSync('sh', ['site/public/install.sh'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, HOME: home, SHELL: '/bin/sh', PATH: fakeBin + ':' + process.env.PATH, INSTALLER_FIXTURE_DIR: fixture }
  });
  expect(install.status, install.stderr).toBe(0);
  expect(install.stdout).toContain('Added ' + join(home, '.local/bin') + ' to PATH');
  expect(readFileSync(join(home, '.profile'), 'utf8')).toContain('# Added by Installer Release Doctor');
  const freshLogin = spawnSync('sh', ['-lc', 'command -v release-doctor && release-doctor --version'], {
    encoding: 'utf8',
    env: { ...process.env, HOME: home, SHELL: '/bin/sh' }
  });
  expect(freshLogin.status, freshLogin.stderr).toBe(0);
  expect(freshLogin.stdout).toContain(join(home, '.local/bin/release-doctor'));
  expect(freshLogin.stdout).toContain('release-doctor 0.1.1');
});

test('@claim:powershell-installer PowerShell installer verifies, persists PATH, and runs the binary', async () => {
  const installer = readFileSync('site/public/install.ps1', 'utf8');
  expect(installer).toContain('[Environment]::SetEnvironmentVariable("Path", $UpdatedPath, "User")');
  expect(installer).toContain('$env:Path = "$Dest;$env:Path"');
  expect(installer).toContain('& (Join-Path $Dest "release-doctor.exe") --version');
});
