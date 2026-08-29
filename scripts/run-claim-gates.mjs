import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8'));
const executable = process.platform === 'win32' ? 'npm.cmd' : 'npm';

for (const claim of claims) {
  process.stdout.write(`\n[claim gate] ${claim.id}\n`);
  const result = spawnSync(executable, ['test', '--', '--grep', `@claim:${claim.id}`], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
