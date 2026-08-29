import { describe, expect, test } from 'vitest';
import { downloadChoices, type ReleaseAsset } from './release';

const assets: ReleaseAsset[] = [
  { name: 'release-doctor-v0.1.2-darwin-aarch64.pkg', browser_download_url: 'https://example.test/arm.pkg' },
  { name: 'release-doctor-v0.1.2-darwin-aarch64.tar.gz', browser_download_url: 'https://example.test/arm.tar.gz' },
  { name: 'release-doctor-v0.1.2-darwin-x86_64.tar.gz', browser_download_url: 'https://example.test/intel.tar.gz' },
  { name: 'release-doctor-v0.1.2-linux-x86_64.tar.gz', browser_download_url: 'https://example.test/linux.tar.gz' },
  { name: 'release-doctor-v0.1.2-windows-x86_64.zip', browser_download_url: 'https://example.test/windows.zip' }
];

describe('downloadChoices', function () {
  test('offers both architectures on Intel Mac user agents without making ARM primary', function () {
    const choices = downloadChoices(assets, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    expect(choices.map(function (choice) { return choice.label; })).toEqual([
      'Download for Apple silicon',
      'Download for Intel Mac'
    ]);
    expect(choices.every(function (choice) { return !choice.primary; })).toBe(true);
    expect(choices[1].asset.name).toContain('darwin-x86_64');
  });

  test('selects the matching archive for Windows and Linux', function () {
    expect(downloadChoices(assets, 'Windows NT')[0].asset.name).toContain('windows-x86_64');
    expect(downloadChoices(assets, 'X11; Linux x86_64')[0].asset.name).toContain('linux-x86_64');
  });
});
