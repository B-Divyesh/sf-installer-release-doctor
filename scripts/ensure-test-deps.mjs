import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const requiredEntries = [
  resolve('node_modules', 'vitest', 'vitest.mjs'),
  resolve('node_modules', 'vite', 'bin', 'vite.js'),
  resolve('node_modules', '@playwright', 'test', 'cli.js')
];
const missingEntries = () => requiredEntries.filter((entry) => !existsSync(entry));

if (missingEntries().length > 0) {
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

if (missingEntries().length > 0) {
  throw new Error(`npm ci completed without required locked test dependencies: ${missingEntries().join(', ')}`);
}
