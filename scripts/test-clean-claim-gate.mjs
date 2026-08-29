import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const source = process.cwd();
const claims = JSON.parse(readFileSync(join(source, '.factory', 'claims.json'), 'utf8'));
const claim = claims.find((entry) => entry.id === 'sample-blocker');
const cloneRoot = mkdtempSync(join(tmpdir(), 'installer-release-doctor-clean-claim-'));
const checkout = join(cloneRoot, 'repo');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

if (!claim || claim.test !== 'npm test -- --grep @claim:sample-blocker') {
  throw new Error('The clean-clone regression must use the exact recorded sample-blocker claim command.');
}

try {
  const clone = spawnSync('git', ['clone', '--quiet', '--no-local', source, checkout], {
    cwd: source,
    encoding: 'utf8'
  });
  if (clone.error) throw clone.error;
  if (clone.status !== 0) throw new Error(`Could not create clean clone: ${clone.stderr}`);
  if (existsSync(join(checkout, 'node_modules'))) {
    throw new Error('Regression fixture unexpectedly contains node_modules before the claim command runs.');
  }

  process.stdout.write(`[clean claim gate] ${claim.test}\n`);
  const result = spawnSync(npm, ['test', '--', '--grep', '@claim:sample-blocker'], {
    cwd: checkout,
    env: process.env,
    stdio: 'inherit'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
  if (!existsSync(join(checkout, 'node_modules', 'vitest', 'vitest.mjs'))) {
    throw new Error('The exact claim command passed without installing its locked Vitest dependency.');
  }
} finally {
  rmSync(cloneRoot, { recursive: true, force: true });
}
