import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8'));
const executable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const results = [];
const evidencePath = process.env.CLAIM_RESULTS_FILE ? resolve(process.env.CLAIM_RESULTS_FILE) : null;

function saveEvidence() {
  if (!evidencePath) return;
  mkdirSync(dirname(evidencePath), { recursive: true });
  writeFileSync(evidencePath, JSON.stringify({ commit: process.env.CLAIM_COMMIT || null, results }, null, 2) + '\n');
}

for (const claim of claims) {
  process.stdout.write(`\n[claim gate] ${claim.id}\n`);
  const startedAt = new Date();
  const result = spawnSync(executable, ['test', '--', '--grep', `@claim:${claim.id}`], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit'
  });
  if (result.error) throw result.error;
  results.push({
    id: claim.id,
    command: claim.test,
    status: result.status === 0 ? 'pass' : 'fail',
    startedAt: startedAt.toISOString(),
    durationSeconds: Math.round((Date.now() - startedAt.getTime()) / 100) / 10
  });
  saveEvidence();
  if (result.status !== 0) process.exit(result.status ?? 1);
}
