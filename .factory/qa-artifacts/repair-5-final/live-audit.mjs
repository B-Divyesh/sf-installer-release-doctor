import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';

const base = 'https://installer-release-doctor.sociobot.in';
const release = await fetch('https://api.github.com/repos/B-Divyesh/sf-installer-release-doctor/releases/latest', {
  headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}
}).then(response => response.json());
const browser = await chromium.launch();
const report = {};

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '/demo', { waitUntil: 'networkidle' });
  await page.getByText('Show repair').click();
  const repairBox = await page.getByText(/Create acme-cli_1.4.0_windows_x86_64.zip.intoto.jsonl/).boundingBox();
  const axe = await new AxeBuilder({ page }).analyze();
  await page.keyboard.press('Tab');
  await page.getByRole('button', { name: 'Run release check' }).focus();
  await page.keyboard.press('Space');
  await page.getByText(/Finished: winget is blocked/).waitFor();
  report.mobile = {
    width: await page.evaluate(() => document.documentElement.scrollWidth),
    repairRight: repairBox && repairBox.x + repairBox.width,
    seriousOrCritical: axe.violations.filter(item => item.impact === 'serious' || item.impact === 'critical').map(item => item.id),
    errors,
    reducedMotionFinished: true
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto(base + '/demo', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Run release check' }).click();
  await page.getByText(/Finished: winget is blocked/).waitFor();
  report.privacy = await page.evaluate(async () => ({
    local: Object.keys(localStorage), session: Object.keys(sessionStorage), cookie: document.cookie,
    databases: indexedDB.databases ? (await indexedDB.databases()).map(database => database.name) : []
  }));
  report.privacy.externalRequests = requests.filter(url => new URL(url).origin !== base);
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.route('https://api.github.com/**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify([release]) }));
  await page.goto(base + '/');
  await page.keyboard.press('Tab');
  const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  await page.keyboard.press('Enter');
  report.keyboard = { firstFocus, route: new URL(page.url()).pathname, h1Focused: await page.locator('h1').evaluate(element => element === document.activeElement) };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' });
  const page = await context.newPage();
  await page.goto(base + '/demo', { waitUntil: 'networkidle' });
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); });
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload({ waitUntil: 'networkidle' });
  await context.setOffline(true);
  const response = await page.reload({ waitUntil: 'domcontentloaded' });
  report.offline = { status: response?.status(), online: await page.evaluate(() => navigator.onLine), heading: await page.locator('h1').innerText(), caches: await page.evaluate(() => caches.keys()) };
  await context.close();
}

{
  const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();
  await page.route('https://api.github.com/**', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify([release]) }));
  await page.goto(base + '/');
  report.intelMac = await page.locator('#download-state .button').evaluateAll(links => links.map(link => ({ label: link.textContent?.trim(), href: link.getAttribute('href'), className: link.className })));
  await context.close();
}

writeFileSync('.factory/qa-artifacts/repair-5-final/live-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
