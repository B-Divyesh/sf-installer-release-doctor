import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('unknown live paths return the deployed 404 document with HTTP 404', async ({ request }) => {
  const response = await request.get('/definitely-missing-qa-path');
  expect(response.status()).toBe(404);
  expect(response.headers()['content-type']).toContain('text/html');
  const document = await response.text();
  expect(document).toContain('<h1 id="not-found-title">This package went to the wrong path</h1>');
  expect(document).toContain('href="/">Return to the workbench</a>');
});

test('the deployed 404 page is keyboard-accessible and has no serious axe findings', async ({ page }) => {
  const response = await page.goto('/definitely-missing-qa-path');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This package went to the wrong path');
  await expect(page.locator('main')).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  expect(await page.evaluate(function () { return document.documentElement.scrollWidth <= window.innerWidth; })).toBe(true);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(function (item) { return item.impact === 'critical' || item.impact === 'serious'; })).toEqual([]);
});
