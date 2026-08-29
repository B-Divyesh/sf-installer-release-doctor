import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = 'https://installer-release-doctor.sociobot.in';
const out = new URL('.', import.meta.url).pathname;
const browser = await chromium.launch({ headless: true });
const report = { base, checkedAt: new Date().toISOString(), routes: [], firstRead: {}, keyboard: {}, demo: {}, reducedMotion: {}, offline: {} };

async function auditRoute(path, viewport, label) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  const response = await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  const dom = await page.evaluate(() => {
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };
    const smallTargets = [...document.querySelectorAll('a,button,input,summary')]
      .filter(visible)
      .map(element => {
        const rect = element.getBoundingClientRect();
        return { label: (element.textContent || element.getAttribute('aria-label') || element.tagName).trim().slice(0, 80), width: Math.round(rect.width), height: Math.round(rect.height) };
      })
      .filter(target => target.width < 44 || target.height < 44);
    return {
      title: document.title,
      lang: document.documentElement.lang,
      h1Count: document.querySelectorAll('h1').length,
      h1: document.querySelector('h1')?.textContent?.trim(),
      mainCount: document.querySelectorAll('main').length,
      headingOutline: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => `${h.tagName}:${h.textContent.trim()}`),
      missingAlt: [...document.images].filter(image => !image.hasAttribute('alt')).length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      smallTargets,
    };
  });
  await page.screenshot({ path: `${out}${label}.png`, fullPage: true });
  report.routes.push({ path, viewport, status: response?.status(), headers: response?.headers(), errors, axeViolations: axe.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })), dom });
  await context.close();
}

for (const [path, name] of [['/', 'home'], ['/demo', 'demo'], ['/privacy', 'privacy'], ['/terms', 'terms'], ['/verification-8-not-found', 'not-found']]) {
  await auditRoute(path, { width: 1366, height: 900 }, `${name}-desktop`);
  await auditRoute(path, { width: 390, height: 844 }, `${name}-mobile`);
}

{
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  const h1 = page.locator('h1');
  const who = page.getByText('For CLI authors checking archives and release evidence before publishing installers.');
  const action = page.getByRole('link', { name: 'Try it with sample data' });
  const outcome = page.getByText('See one blocked release and its repair.');
  report.firstRead = {
    h1: await h1.textContent(), h1Visible: await h1.isVisible(), whoVisible: await who.isVisible(),
    actionVisible: await action.isVisible(), outcomeVisible: await outcome.isVisible(),
    h1Box: await h1.boundingBox(), whoBox: await who.boundingBox(), actionBox: await action.boundingBox(), outcomeBox: await outcome.boundingBox(),
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute('href'), outline: getComputedStyle(document.activeElement).outline, outlineOffset: getComputedStyle(document.activeElement).outlineOffset }));
  const sequence = [first];
  for (let index = 0; index < 6; index += 1) {
    await page.keyboard.press('Tab');
    sequence.push(await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim().slice(0, 80), href: document.activeElement?.getAttribute('href'), outline: getComputedStyle(document.activeElement).outline, outlineOffset: getComputedStyle(document.activeElement).outlineOffset })));
  }
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  await page.keyboard.press('Enter');
  await page.waitForURL(/demo=1/);
  report.keyboard = { sequence, routeFocus: await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim() })) };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const requests = [];
  const errors = [];
  page.on('request', request => requests.push({ method: request.method(), url: request.url(), postData: request.postData() }));
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  const before = await page.evaluate(async () => ({ cookies: document.cookie, localStorage: { ...localStorage }, sessionStorage: { ...sessionStorage }, dbs: await indexedDB.databases() }));
  const run = page.getByRole('button', { name: 'Run release check' });
  await run.focus();
  await page.keyboard.press('Enter');
  await page.getByText('Finished: winget is blocked by 1 missing file.').waitFor();
  const focusedAfterRun = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim() }));
  await page.getByText('Show repair', { exact: true }).click();
  const repair = await page.getByText(/Create acme-cli_1\.4\.0_windows_x86_64\.zip\.intoto\.jsonl/).textContent();
  const expandedOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.screenshot({ path: `${out}demo-mobile-expanded.png`, fullPage: true });
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const afterReset = await page.evaluate(async () => ({ cookies: document.cookie, localStorage: { ...localStorage }, sessionStorage: { ...sessionStorage }, dbs: await indexedDB.databases() }));
  report.demo = { requests, offOriginRequests: requests.filter(r => new URL(r.url).origin !== base), errors, before, afterReset, focusedAfterRun, repair, expandedOverflow, banner: await page.getByText('Demo — sample data, nothing is saved').isVisible() };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  const started = Date.now();
  await page.getByRole('button', { name: 'Run release check' }).click();
  await page.getByText('Finished: winget is blocked by 1 missing file.').waitFor();
  report.reducedMotion = { elapsedMs: Date.now() - started, mediaMatches: await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches) };
  await context.close();
}

{
  const context = await browser.newContext({ serviceWorkers: 'allow', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => navigator.serviceWorker?.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload({ waitUntil: 'networkidle' });
  const update = await page.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); return { active: registration.active?.scriptURL, controller: navigator.serviceWorker.controller?.scriptURL, caches: await caches.keys() }; });
  await context.setOffline(true);
  const response = await page.reload({ waitUntil: 'domcontentloaded' });
  report.offline = { ...update, status: response?.status(), title: await page.title(), banner: await page.getByText('Demo — sample data, nothing is saved').isVisible() };
  await context.close();
}

writeFileSync(`${out}live-audit.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify({
  routes: report.routes.map(r => ({ path: r.path, width: r.viewport.width, status: r.status, errors: r.errors.length, axe: r.axeViolations, overflow: r.dom.overflow, smallTargets: r.dom.smallTargets })),
  firstRead: report.firstRead,
  keyboard: report.keyboard,
  demo: { offOriginRequests: report.demo.offOriginRequests, errors: report.demo.errors, focusedAfterRun: report.demo.focusedAfterRun, expandedOverflow: report.demo.expandedOverflow, before: report.demo.before, afterReset: report.demo.afterReset },
  reducedMotion: report.reducedMotion,
  offline: report.offline,
}, null, 2));
await browser.close();
