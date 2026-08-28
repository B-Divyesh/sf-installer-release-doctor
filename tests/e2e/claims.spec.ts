import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, readdirSync } from 'node:fs';
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
  expect(formula).toContain('class InstallerReleaseDoctor < Formula');
  expect(formula).toContain('version "0.1.1"');

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
  expect(config.routes).toContainEqual({ route: '/assets/*', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } });
  expect(config.routes).toContainEqual({ route: '/sw.js', headers: { 'Cache-Control': 'no-cache' } });
  expect(readdirSync('dist/site/assets').some(function (name) { return /^index-[\w-]+\.js$/.test(name); })).toBe(true);
});

test('release automation cannot silently skip or overwrite the Homebrew tap', async () => {
  const workflow = readFileSync('.github/workflows/release.yml', 'utf8');
  expect(workflow).toContain('TAP_GITHUB_TOKEN is required');
  expect(workflow).toContain('FORMULA_SHA=');
  expect(workflow).not.toContain("if: ${{ env.TAP_GITHUB_TOKEN != '' }}");
});

test('service worker installs and updates the versioned demo cache', async ({ page }) => {
  await page.goto('/demo');
  const worker = await page.evaluate(async function () {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return { script: registration.active?.scriptURL, cacheNames: await caches.keys() };
  });
  expect(worker.script).toMatch(/\/sw\.js$/);
  expect(worker.cacheNames).toContain('release-doctor-v3');
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

test('license return is stored and removed from the address bar', async ({ page }) => {
  await page.route('https://api.sociobot.in/**', function (route) { return route.fulfill({ json: { valid: true, reason: 'ok' } }); });
  await page.goto('/?license=test-token');
  await expect(page).toHaveURL('/');
  expect(await page.evaluate(function () { return localStorage.getItem('sb_license:installer-release-doctor'); })).toBe('test-token');
});
