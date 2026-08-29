import './styles.css';
import './a11y.css';
import { channelStatus, sampleReport, type Finding } from './report';
import { downloadChoices, type ReleaseAsset } from './release';

const app = document.querySelector<HTMLDivElement>('#app')!;
const metadata: Record<string, { title: string; description: string }> = {
  '/': { title: 'Installer Release Doctor — Check installer releases', description: 'Check installer archives and release evidence before publishing packages.' },
  '/demo': { title: 'Demo — Installer Release Doctor', description: 'Inspect a bundled installer release with one blocker and a specific repair.' },
  '/privacy': { title: 'Privacy — Installer Release Doctor', description: 'Learn what the local checker and website read, store, and request.' },
  '/terms': { title: 'Terms — Installer Release Doctor', description: 'Read the license, warranty, and release responsibilities for the checker.' },
  '/404': { title: 'Page not found — Installer Release Doctor', description: 'The requested Installer Release Doctor page was not found.' }
};

function shell(content: string, demo = false) {
  const banner = demo ? '<aside class="demo-banner"><span><strong>Demo</strong> — sample data, nothing is saved</span><span><button data-reset>Reset demo</button><a href="/" data-link>Leave demo</a></span></aside>' : '';
  return banner +
    '<header class="site-header"><a class="wordmark" href="/" data-link aria-label="Installer Release Doctor home"><span aria-hidden="true">IR/DR</span><b>Installer<br>Release Doctor</b></a><nav aria-label="Main navigation"><a href="/demo" data-link>Demo</a><a href="/#install">Install</a><a href="/privacy" data-link>Privacy</a></nav></header>' +
    '<main id="main" tabindex="-1">' + content + '</main>' +
    '<footer><p><strong>Installer Release Doctor</strong><br>Check installer artifacts before upload.</p><nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in/" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></nav><p>v0.1.4 · build 2026.08</p></footer>';
}

function icon(kind: string) {
  return '<span class="status-icon" aria-hidden="true">' + (kind === 'pass' ? '✓' : kind === 'fail' ? '×' : '!') + '</span>';
}
function findingRows(items: Finding[]) {
  return items.map(function (item) {
    const repair = item.repair ? '<details><summary>Show repair</summary><p>' + item.repair + '</p></details>' : '';
    return '<li class="finding ' + item.level + '">' + icon(item.level) + '<div><b>' + item.channel + ' / ' + item.check + '</b><p>' + item.message + '</p>' + repair + '</div></li>';
  }).join('');
}

function home() {
  return shell(
    '<section class="hero"><div class="hero-copy"><p class="eyebrow">LOCAL RELEASE CHECKER · POLICY 2026-08</p><h1>Check installer releases before upload</h1><p class="lede">For CLI authors checking archives and release evidence before publishing installers.</p><div class="hero-actions"><a class="button primary" href="/?demo=1" data-link>Try it with sample data</a><span>See one blocked release and its repair.</span></div><ul class="plain-facts"><li>Runs on local files</li><li>No account or network required</li><li>Core checker is free</li></ul></div><figure class="hero-art"><picture><source srcset="/assets/release-inspection-640.webp 640w, /assets/release-inspection.webp 1200w" sizes="(max-width: 760px) 100vw, 48vw"><img src="/assets/release-inspection.webp" width="1200" height="800" alt="A package moves through a mechanical inspection bench into release channels." fetchpriority="high"></picture><figcaption>The checker validates one artifact against each channel’s requirements.</figcaption></figure></section>' +
    '<section class="preview section" aria-labelledby="preview-title"><div class="section-label">01 / LIVE PREVIEW</div><div><h2 id="preview-title">Sample release report</h2><p>The sample uses one YAML manifest. Its failed check includes a repair step.</p></div><div class="terminal" tabindex="0" aria-label="Sample release-doctor output"><div class="terminal-bar"><span>release-doctor check</span><span>exit 1</span></div><pre><code><span class="term-pass">PASS</span> homebrew  archive-layout   Binary and license found.\n<span class="term-fail">FAIL</span> winget    provenance       Provenance companion is missing.\n      repair: Create the .intoto.jsonl companion.\n<span class="term-warn">WARN</span> apt       package-metadata Maintainer URL is not set.\n────────────────────────────────────────────────────────\n2 of 3 channels ready · 1 warning · 1 blocker</code></pre></div></section>' +
    '<section class="section how" aria-labelledby="how-title"><div class="section-label">02 / HOW IT WORKS</div><div><h2 id="how-title">Inspect a release in three steps</h2><ol class="steps"><li><span>1</span><div><h3>Describe channels</h3><p>List each artifact and its required evidence in one YAML manifest.</p></div></li><li><span>2</span><div><h3>Run local checks</h3><p>The CLI reads archives safely. Signature checks use the public key in your manifest.</p></div></li><li><span>3</span><div><h3>Repair blockers</h3><p>Use the channel matrix or GitHub Actions annotations before upload.</p></div></li></ol></div></section>' +
    '<section class="section boundaries" aria-labelledby="boundaries-title"><div class="section-label">03 / BOUNDARIES</div><div><h2 id="boundaries-title">Checks are read-only</h2><p>It checks artifacts you already built. A default check reports findings without changing those artifacts.</p><a href="/privacy" data-link>Read the privacy note</a></div></section>' +
    '<section id="install" class="section install" aria-labelledby="install-title"><div class="section-label">04 / INSTALL</div><div><h2 id="install-title">Install the local checker</h2><div id="download-state" aria-live="polite"><p>Checking published builds…</p></div><div class="install-tabs"><div><h3>macOS and Linux</h3><code>curl -fsSL https://installer-release-doctor.sociobot.in/install.sh | sh</code></div><div><h3>Windows PowerShell</h3><code>irm https://installer-release-doctor.sociobot.in/install.ps1 | iex</code></div><div><h3>Homebrew</h3><code>brew install B-Divyesh/installer-release-doctor/installer-release-doctor</code></div></div><p class="fine">Downloads have no publisher signature. macOS binaries may use ad hoc signatures. Inspect checksums before installation.</p></div></section>' +
    '<section class="section availability" aria-labelledby="availability-title"><div class="section-label">05 / AVAILABILITY</div><div><h2 id="availability-title">Use the free checker today</h2><p>The local checker is available now. It checks release evidence before you upload.</p><p class="fine">Company policy packs are not offered from this site until checkout is available.</p></div></section>'
  );
}

function demo() {
  const orderedFindings = [
    ...sampleReport.findings.filter(function (item) { return item.level === 'fail'; }),
    ...sampleReport.findings.filter(function (item) { return item.level !== 'fail'; })
  ];
  const matrix = ['winget'].map(function (channel) {
    const status = channelStatus(sampleReport, channel);
    return '<div><b>' + channel + '</b><span class="stamp ' + status + '">' + (status === 'fail' ? 'blocked' : status) + '</span></div>';
  }).join('');
  return shell(
    '<section class="demo-workbench"><p class="eyebrow">TEMP WORKSPACE / ACME CLI 1.4.0</p><h1>Inspect the sample release</h1><p class="lede">The completed report has one blocker. Open it to see the repair.</p><div class="demo-controls"><button class="button primary" data-run>Run release check again</button><span class="run-status" aria-live="polite">Finished: winget is blocked by 1 missing file.</span></div><div class="matrix" aria-label="Channel readiness">' + matrix + '</div><section aria-labelledby="results-title"><h2 id="results-title">11 checks</h2><ul class="findings">' + findingRows(orderedFindings) + '</ul></section><section class="demo-command" aria-labelledby="demo-command-title"><h2 id="demo-command-title">Run the same demo in the CLI</h2><code>release-doctor demo</code><p>It creates a temporary workspace and prints where it ran.</p></section></section>', true
  );
}

function privacy() {
  return shell('<article class="legal"><p class="eyebrow">LEGAL / PLAIN WORDS</p><h1>Your release artifacts stay local</h1><p>Last updated August 29, 2026.</p><h2>Local checker</h2><p>The CLI reads the paths you give it. It sends no artifacts, manifests, keys, or results over the network.</p><h2>Website</h2><p>The demo uses bundled sample data. Demo actions stay in memory and are discarded when you leave.</p><p>The landing page caches GitHub\'s public release listing for one hour. The website collects no release or account data.</p><h2>Contact</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> for privacy questions.</p></article>');
}
function terms() {
  return shell('<article class="legal"><p class="eyebrow">LEGAL / PLAIN WORDS</p><h1>Terms for using the checker</h1><p>Last updated August 29, 2026.</p><h2>License</h2><p>The core checker is MIT-licensed.</p><h2>No release guarantee</h2><p>Channel rules change. A passing report reduces known blockers but does not guarantee acceptance.</p><h2>Liability</h2><p>The software is provided without warranty. You remain responsible for signing, publishing, and protecting credentials.</p></article>');
}
function notFound() {
  return shell('<section class="not-found"><p class="error-code">404 / PAGE ERROR</p><h1>Page not found</h1><p>The requested page does not exist.</p><a class="button primary" href="/" data-link>Open the checker home page</a></section>');
}

function setMetadata(route: string, canonicalPath: string) {
  const current = metadata[route];
  document.title = current.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', current.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', current.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', current.description);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', 'https://installer-release-doctor.sociobot.in' + canonicalPath);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', current.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', current.description);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', 'https://installer-release-doctor.sociobot.in' + canonicalPath);
}

function navigate(target: string, replace = false, focusHeading = true) {
  const url = new URL(target, location.origin);
  const clean = url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
  const demoMode = (clean === '/' && url.searchParams.get('demo') === '1') || clean === '/demo';
  const route = demoMode ? '/demo' : ['/', '/privacy', '/terms'].includes(clean) ? clean : '/404';
  app.innerHTML = route === '/' ? home() : route === '/demo' ? demo() : route === '/privacy' ? privacy() : route === '/terms' ? terms() : notFound();
  setMetadata(route, route === '/404' ? clean : route);
  bind();
  if (!replace) history.pushState({}, '', url.pathname + url.search + url.hash);
  window.scrollTo(0, 0);
  const heading = document.querySelector<HTMLElement>('h1');
  if (focusHeading) {
    heading?.setAttribute('tabindex', '-1');
    heading?.focus();
  }
  document.querySelector('.route-status')!.textContent = heading?.textContent || '';
}

function bind() {
  document.querySelectorAll<HTMLAnchorElement>('[data-link]').forEach(function (anchor) {
    anchor.addEventListener('click', function (event) {
      event.preventDefault();
      const url = new URL(anchor.href);
      navigate(url.pathname + url.search + url.hash);
    });
  });
  document.querySelector('[data-reset]')?.addEventListener('click', function () { navigate('/demo', true); });
  document.querySelector('[data-run]')?.addEventListener('click', function (event) {
    const button = event.currentTarget as HTMLButtonElement;
    const status = document.querySelector('.run-status')!;
    button.disabled = true;
    status.textContent = 'Inspecting archives and channel evidence…';
    document.querySelector('.demo-workbench')?.classList.add('scanning');
    const finish = function () {
      status.textContent = 'Finished: winget is blocked by 1 missing file.';
      button.disabled = false;
      button.focus();
    };
    matchMedia('(prefers-reduced-motion: reduce)').matches ? finish() : window.setTimeout(finish, 700);
  });
  if (location.pathname === '/' && new URLSearchParams(location.search).get('demo') !== '1') void loadRelease();
}

async function loadRelease() {
  const element = document.querySelector('#download-state');
  if (!element) return;
  try {
    const cached = JSON.parse(localStorage.getItem('release-cache:v2') || 'null');
    let release = cached && Date.now() - cached.saved < 3600000 ? cached.data : null;
    if (!release) {
      const response = await fetch('https://api.github.com/repos/B-Divyesh/sf-installer-release-doctor/releases?per_page=1');
      if (!response.ok) throw new Error('not published');
      const releases = await response.json();
      release = releases[0];
      if (!release) throw new Error('not published');
      localStorage.setItem('release-cache:v2', JSON.stringify({ saved: Date.now(), data: release }));
    }
    const assets = release.assets as ReleaseAsset[];
    const hasChecksums = assets.some(function (asset) { return asset.name === 'SHA256SUMS'; });
    const choices = hasChecksums ? downloadChoices(assets, navigator.userAgent) : [];
    const downloads = choices.map(function (choice) {
      return '<a class="button ' + (choice.primary ? 'primary' : 'secondary') + '" href="' + choice.asset.browser_download_url + '">' + choice.label + '</a>';
    }).join('');
    const macLabel = /Mac/i.test(navigator.userAgent) && choices.length ? '<p><strong>Choose your Mac:</strong></p>' : '';
    element.innerHTML = choices.length ? macLabel + '<div class="download-choices">' + downloads + '</div><p>Published ' + release.tag_name + '. SHA256SUMS is included.</p>' : '<p>Build ' + release.tag_name + ' is published. Choose an asset on the <a href="' + release.html_url + '">GitHub Release page.</a></p>';
  } catch {
    element.innerHTML = '<p><strong>Downloads are being published.</strong><br>Use the install command, or check the <a href="https://github.com/B-Divyesh/sf-installer-release-doctor/releases">GitHub Releases page.</a></p>';
  }
}

window.addEventListener('popstate', function () { navigate(location.pathname + location.search, true); });
navigate(location.pathname + location.search, true, false);
if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
