import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const base = process.argv[2] || 'http://127.0.0.1:4173';
const output = resolve(process.argv[3] || '.factory/qa-artifacts/polish-1/local');
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { base, generatedAt: new Date().toISOString(), firstScreen: {}, routes: {}, demo: {} };

for (const viewport of [{ name: 'desktop', width: 1366, height: 768 }, { name: 'mobile', width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  const selectors = ['h1', '.hero .lede', '.hero-actions a', '.hero-actions span', '.plain-facts li:nth-child(1)', '.plain-facts li:nth-child(2)', '.plain-facts li:nth-child(3)'];
  const bounds = {};
  for (const selector of selectors) bounds[selector] = await page.locator(selector).evaluate((element) => element.getBoundingClientRect().toJSON());
  await page.screenshot({ path: `${output}/cold-${viewport.name}.png`, fullPage: false });
  report.firstScreen[viewport.name] = { viewport, bounds, allFit: Object.values(bounds).every((box) => box.bottom <= viewport.height), errors };
  await context.close();
}

const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const requests = [];
page.on('request', (request) => requests.push(request.url()));
await page.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'Run release check' }).click();
await page.getByText('Show repair').click();
await page.screenshot({ path: `${output}/demo-mobile.png`, fullPage: true });
const storageBeforeReset = await page.evaluate(async () => ({
  local: Object.keys(localStorage), session: Object.keys(sessionStorage), cookies: document.cookie,
  databases: indexedDB.databases ? (await indexedDB.databases()).map((database) => database.name) : []
}));
await page.getByRole('button', { name: 'Reset demo' }).click();
const storageAfterReset = await page.evaluate(async () => ({
  local: Object.keys(localStorage), session: Object.keys(sessionStorage), cookies: document.cookie,
  databases: indexedDB.databases ? (await indexedDB.databases()).map((database) => database.name) : []
}));
await page.waitForFunction(() => navigator.serviceWorker?.controller);
await context.setOffline(true);
await page.reload();
const offlineHeading = await page.locator('h1').textContent();
await context.setOffline(false);
const axe = await new AxeBuilder({ page }).analyze();
report.demo = {
  sameOriginOnly: requests.every((request) => new URL(request).origin === new URL(base).origin),
  storageBeforeReset,
  storageAfterReset,
  offlineHeading,
  axeViolations: axe.violations.map(({ id, impact }) => ({ id, impact }))
};
await context.close();

for (const route of ['/', '/demo', '/privacy', '/terms', '/missing']) {
  const routeContext = await browser.newContext();
  const routePage = await routeContext.newPage();
  const errors = [];
  routePage.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  routePage.on('pageerror', (error) => errors.push(error.message));
  const response = await routePage.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  const routeAxe = await new AxeBuilder({ page: routePage }).analyze();
  report.routes[route] = await routePage.evaluate(({ status, errors, violations }) => ({
    status,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    h1: [...document.querySelectorAll('h1')].map((heading) => heading.textContent),
    main: document.querySelectorAll('main').length,
    errors,
    axeViolations: violations
  }), { status: response?.status(), errors, violations: routeAxe.violations.map(({ id, impact }) => ({ id, impact })) });
  await routeContext.close();
}

writeFileSync(`${output}/audit.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(JSON.stringify(report, null, 2));
