import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('unknown live paths return the deployed 404 document with HTTP 404', async ({ request }) => {
  const response = await request.get('/definitely-missing-qa-path');
  expect(response.status()).toBe(404);
  expect(response.headers()['content-type']).toContain('text/html');
  const document = await response.text();
  expect(document).toContain('<h1 id="not-found-title">Page not found</h1>');
  expect(document).toContain('href="/">Open the checker home page</a>');
  expect(document).not.toContain('/#pricing');
});

test('the deployed 404 page is keyboard-accessible and has no serious axe findings', async ({ page }) => {
  const response = await page.goto('/definitely-missing-qa-path');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
  await expect(page.locator('main')).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  expect(await page.evaluate(function () { return document.documentElement.scrollWidth <= window.innerWidth; })).toBe(true);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(function (item) { return item.impact === 'critical' || item.impact === 'serious'; })).toEqual([]);
});

test('the deployed site does not expose the unavailable policy-pack checkout', async ({ page }) => {
  const billingRequests: string[] = [];
  page.on('request', function (request) {
    if (new URL(request.url()).origin === 'https://api.sociobot.in') billingRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Buy the policy pack/i })).toHaveCount(0);
  await expect(page.locator('a[href*="api.sociobot.in"]')).toHaveCount(0);
  await expect(page.getByText('$49', { exact: true })).toHaveCount(0);
  expect(billingRequests).toEqual([]);
});
