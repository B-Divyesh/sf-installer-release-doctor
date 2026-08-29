import { createServer } from 'node:http';
import { createReadStream, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';

const root = process.argv[2];
const port = Number(process.argv[3] || 8765);
const version = process.argv[4];
if (!version) throw new Error('A fixture release version is required.');
const origin = `http://127.0.0.1:${port}`;

createServer((request, response) => {
  if (request.url === '/release') {
    const assets = readdirSync(root).filter((name) => name !== 'release.json').map((name) => ({
      name,
      browser_download_url: `${origin}/${name}`
    }));
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ tag_name: `v${version}`, assets }));
    return;
  }
  const name = basename(new URL(request.url, origin).pathname);
  if (!readdirSync(root).includes(name)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'content-type': 'application/octet-stream' });
  createReadStream(join(root, name)).pipe(response);
}).listen(port, '127.0.0.1');
