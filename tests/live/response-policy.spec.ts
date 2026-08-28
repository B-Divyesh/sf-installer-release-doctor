import { expect, test } from '@playwright/test';

test('unknown live paths return the deployed 404 document with HTTP 404', async ({ request }) => {
  const response = await request.get('/definitely-missing-qa-path');
  expect(response.status()).toBe(404);
  expect(response.headers()['content-type']).toContain('text/html');
  const document = await response.text();
  expect(document).toContain('<h1 id="not-found-title">This package went to the wrong path</h1>');
  expect(document).toContain('href="/">Return to the workbench</a>');
});
