import { spawnSync } from 'node:child_process';

const port = process.env.PLAYWRIGHT_PORT || String(10_000 + (process.pid % 40_000));
const executable = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(executable, ['playwright', 'test', ...process.argv.slice(2)], {
  cwd: process.cwd(),
  env: { ...process.env, PLAYWRIGHT_PORT: port },
  stdio: 'inherit'
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
