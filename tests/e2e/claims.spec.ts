import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
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
  for (const route of ['/', '/demo', '/privacy', '/terms', '/missing']) {
    await page.goto(route);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(function (item) { return item.impact === 'critical' || item.impact === 'serious'; })).toEqual([]);
  }
});

test('keyboard path enters and resets the demo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/demo$/);
  await page.getByRole('button', { name: 'Reset demo' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Ready to inspect the winget channel.')).toBeVisible();
});

test('license return is stored and removed from the address bar', async ({ page }) => {
  await page.route('https://api.sociobot.in/**', function (route) { return route.fulfill({ json: { valid: true, reason: 'ok' } }); });
  await page.goto('/?license=test-token');
  await expect(page).toHaveURL('/');
  expect(await page.evaluate(function () { return localStorage.getItem('sb_license:installer-release-doctor'); })).toBe('test-token');
});
