import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const [version, repository, directory] = process.argv.slice(2);
if (!version || !repository || !directory) throw new Error('usage: make-latest.mjs VERSION REPOSITORY DIRECTORY');
const assets = readdirSync(directory).filter(function (name) { return name.startsWith('release-doctor-'); }).map(function (name) {
  return {name, url: 'https://github.com/' + repository + '/releases/download/v' + version + '/' + name, sha256: createHash('sha256').update(readFileSync(join(directory, name))).digest('hex')};
});
writeFileSync(join(directory, 'latest.json'), JSON.stringify({version, assets}, null, 2) + '\n');
