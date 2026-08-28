import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';

const base = 'https://installer-release-doctor.sociobot.in';
const browser = await chromium.launch({ headless: true });
const report = { generatedAt: new Date().toISOString(), routes: [], flows: {} };

for (const viewport of [{ name: 'desktop', width: 1366, height: 900 }, { name: 'mobile-390', width: 390, height: 844 }]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  for (const path of ['/', '/demo', '/privacy', '/terms', '/qa-missing-v5']) {
    const response = await page.goto(base + path, { waitUntil: 'networkidle' });
    const axe = await new AxeBuilder({ page }).analyze();
    const data = await page.evaluate(() => {
      const targets = [...document.querySelectorAll('a,button,input,summary')].filter(element => {
        const style = getComputedStyle(element);
        const box = element.getBoundingClientRect();
        return style.visibility !== 'hidden' && style.display !== 'none' && box.width > 0 && box.height > 0;
      });
      const tooSmall = targets.map(element => {
        const box = element.getBoundingClientRect();
        return { text: (element.textContent || element.getAttribute('aria-label') || '').trim(), width: box.width, height: box.height };
      }).filter(box => box.width < 44 || box.height < 44);
      return {
        title: document.title,
        lang: document.documentElement.lang,
        h1Count: document.querySelectorAll('h1').length,
        mainCount: document.querySelectorAll('main').length,
        missingAlt: [...document.images].filter(image => !image.hasAttribute('alt')).length,
        headingLevels: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => Number(h.tagName.slice(1))),
        overflow: document.documentElement.scrollWidth > innerWidth,
        tooSmall,
        localStorage: { ...localStorage }
      };
    });
    report.routes.push({ viewport: viewport.name, path, status: response?.status(), headers: response?.headers(), errors: [...errors], seriousOrCritical: axe.violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => v.id), ...data });
  }
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();
  const requests = [];
  const errors = [];
  page.on('request', request => requests.push({ method: request.method(), url: request.url() }));
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  await page.goto(base + '/demo', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Run release check' }).click();
  await page.getByText(/Finished: winget is blocked/).waitFor();
  await page.getByText('Show repair').click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  report.flows.demoPrivacy = {
    requests,
    externalRequests: requests.filter(item => new URL(item.url).origin !== base),
    errors,
    banner: await page.locator('.demo-banner').innerText(),
    statusAfterReset: await page.locator('.run-status').innerText(),
    localStorage: await page.evaluate(() => ({ ...localStorage }))
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const skipFocus = await page.evaluate(() => {
    const active = document.activeElement;
    const style = getComputedStyle(active);
    return { text: active?.textContent?.trim(), outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineColor: style.outlineColor };
  });
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  const primaryFocus = await page.evaluate(() => {
    const active = document.activeElement;
    const style = getComputedStyle(active);
    return { text: active?.textContent?.trim(), outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, outlineColor: style.outlineColor };
  });
  await page.keyboard.press('Enter');
  const routeFocus = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: document.activeElement?.textContent?.trim() }));
  const started = performance.now();
  await page.getByRole('button', { name: 'Run release check' }).click();
  await page.getByText(/Finished: winget is blocked/).waitFor();
  report.flows.keyboardAndReducedMotion = { skipFocus, primaryFocus, routeFocus, elapsedMs: Math.round(performance.now() - started) };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto(base + '/demo', { waitUntil: 'networkidle' });
  const before = await page.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); return { active: registration.active?.scriptURL, caches: await caches.keys(), controlled: Boolean(navigator.serviceWorker.controller) }; });
  if (!before.controlled) { await page.reload({ waitUntil: 'networkidle' }); }
  await context.setOffline(true);
  const response = await page.reload({ waitUntil: 'domcontentloaded' });
  report.flows.offline = { before, reloadStatus: response?.status(), heading: await page.locator('h1').innerText(), online: await page.evaluate(() => navigator.onLine) };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  await page.route('https://api.github.com/**', route => route.abort('failed'));
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  report.flows.releaseApiFailure = { downloadState: await page.locator('#download-state').innerText(), errors };
  await context.close();
}

writeFileSync('.factory/qa-artifacts/verification-5/live-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
