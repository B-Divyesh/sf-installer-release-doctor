import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const vitestEntry = resolve('node_modules', 'vitest', 'vitest.mjs');

if (!existsSync(vitestEntry)) {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  process.stdout.write('Locked web test dependencies are missing; running npm ci.\n');
  const result = spawnSync(npm, ['ci', '--no-audit', '--no-fund'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit'
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync(vitestEntry)) {
  throw new Error('npm ci completed without the locked Vitest dependency.');
}
