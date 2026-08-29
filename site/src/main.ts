import './styles.css';
import './a11y.css';
import { channelStatus, sampleReport, type Finding } from './report';
import { downloadChoices, type ReleaseAsset } from './release';

const app = document.querySelector<HTMLDivElement>('#app')!;
const titles: Record<string, string> = {
  '/': 'Installer Release Doctor — Check installer releases',
  '/demo': 'Demo — Installer Release Doctor',
  '/privacy': 'Privacy — Installer Release Doctor',
  '/terms': 'Terms — Installer Release Doctor',
  '/404': 'Page not found — Installer Release Doctor'
};

function shell(content: string, demo = false) {
  const banner = demo ? '<aside class="demo-banner"><span><strong>Demo</strong> — sample data, nothing is saved</span><span><button data-reset>Reset demo</button><a href="/" data-link>Start for real</a></span></aside>' : '';
  return banner +
    '<header class="site-header"><a class="wordmark" href="/" data-link aria-label="Installer Release Doctor home"><span aria-hidden="true">IR/DR</span><b>Installer<br>Release Doctor</b></a><nav aria-label="Main navigation"><a href="/demo" data-link>Demo</a><a href="/#install">Install</a><a href="/privacy" data-link>Privacy</a></nav></header>' +
    '<main id="main" tabindex="-1">' + content + '</main>' +
    '<footer><p><strong>Installer Release Doctor</strong><br>Check installer artifacts before upload.</p><nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in/" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></nav><p>v0.1.2 · build 2026.08</p></footer>';
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
    '<section class="hero"><div class="hero-copy"><p class="eyebrow">PRE-FLIGHT / LOCAL CLI / POLICY 2026-08</p><h1>Check installer releases before upload</h1><p class="lede">For CLI authors shipping signed releases across package channels without learning every policy.</p><div class="hero-actions"><a class="button primary" href="/demo" data-link>Try it with sample data</a><span>See one blocked release and its repair.</span></div><ul class="plain-facts"><li>Runs on local files</li><li>No account or network required</li><li>Core checker is free</li></ul></div><figure class="hero-art"><picture><source srcset="/assets/release-inspection-640.webp 640w, /assets/release-inspection.webp 1200w" sizes="(max-width: 760px) 100vw, 48vw"><img src="/assets/release-inspection.webp" width="1200" height="800" alt="A package moves through a mechanical inspection bench into release channels." fetchpriority="high"></picture><figcaption>One artifact enters. Channel-specific evidence leaves.</figcaption></figure></section>' +
    '<section class="preview section" aria-labelledby="preview-title"><div class="section-label">01 / LIVE PREVIEW</div><div><h2 id="preview-title">Find the blocker before CI does</h2><p>One manifest describes the release. Each result names the failed check and the next repair.</p></div><div class="terminal" tabindex="0" aria-label="Sample release-doctor output"><div class="terminal-bar"><span>release-doctor check</span><span>exit 1</span></div><pre><code><span class="term-pass">PASS</span> homebrew  archive-layout   Binary and license found.\n<span class="term-fail">FAIL</span> winget    provenance       Provenance companion is missing.\n      repair: Create the .intoto.jsonl companion.\n<span class="term-warn">WARN</span> apt       package-metadata Maintainer URL is not set.\n────────────────────────────────────────────────────────\n2 of 3 channels ready · 1 warning · 1 failure</code></pre></div></section>' +
    '<section class="section how" aria-labelledby="how-title"><div class="section-label">02 / HOW IT WORKS</div><div><h2 id="how-title">Inspect a release in three steps</h2><ol class="steps"><li><span>1</span><div><h3>Describe channels</h3><p>List each artifact and its required evidence in one YAML manifest.</p></div></li><li><span>2</span><div><h3>Run local checks</h3><p>The CLI reads archives safely. Signature checks use the public key in your manifest.</p></div></li><li><span>3</span><div><h3>Repair blockers</h3><p>Use the channel matrix or GitHub Actions annotations before upload.</p></div></li></ol></div></section>' +
    '<section class="section boundaries" aria-labelledby="boundaries-title"><div class="section-label">03 / BOUNDARIES</div><div><h2 id="boundaries-title">The checker stays in its lane</h2><p>It checks files you already built. A default check reports findings without changing those files.</p><a href="/privacy" data-link>Read the privacy note</a></div></section>' +
    '<section id="install" class="section install" aria-labelledby="install-title"><div class="section-label">04 / INSTALL</div><div><h2 id="install-title">Install the local checker</h2><div id="download-state" aria-live="polite"><p>Checking published builds…</p></div><div class="install-tabs"><div><h3>macOS and Linux</h3><code>curl -fsSL https://installer-release-doctor.sociobot.in/install.sh | sh</code></div><div><h3>Windows PowerShell</h3><code>irm https://installer-release-doctor.sociobot.in/install.ps1 | iex</code></div><div><h3>Homebrew</h3><code>brew install B-Divyesh/installer-release-doctor/installer-release-doctor</code></div></div><p class="fine">macOS and Windows builds are unsigned in v0.1.2. Inspect checksums before installation.</p></div></section>' +
    '<section class="section availability" aria-labelledby="availability-title"><div class="section-label">05 / AVAILABILITY</div><div><h2 id="availability-title">Use the free checker today</h2><p>The local checker is available now. It checks release evidence before you upload.</p><p class="fine">Company policy packs are not offered from this site until checkout is available.</p></div></section>'
  );
}

function demo() {
  const matrix = ['winget'].map(function (channel) {
    const status = channelStatus(sampleReport, channel);
    return '<div><b>' + channel + '</b><span class="stamp ' + status + '">' + (status === 'fail' ? 'blocked' : status) + '</span></div>';
  }).join('');
  return shell(
    '<section class="demo-workbench"><p class="eyebrow">TEMP WORKSPACE / ACME CLI 1.4.0</p><h1>Inspect the sample release</h1><p class="lede">The sample has one blocker. Expand the failed result to see its repair.</p><div class="demo-controls"><button class="button primary" data-run>Run release check</button><span class="run-status" aria-live="polite">Ready to inspect the winget channel.</span></div><div class="matrix" aria-label="Channel readiness">' + matrix + '</div><section aria-labelledby="results-title"><h2 id="results-title">11 checks</h2><ul class="findings">' + findingRows(sampleReport.findings) + '</ul></section><aside class="demo-command"><h2>Run the same demo in the CLI</h2><code>release-doctor demo</code><p>It creates a temporary workspace and prints where it ran.</p></aside></section>', true
  );
}

function privacy() {
  return shell('<article class="legal"><p class="eyebrow">LEGAL / PLAIN WORDS</p><h1>Your release files stay local</h1><p>Last updated August 28, 2026.</p><h2>Local checker</h2><p>The CLI reads the paths you give it. It sends no artifacts, manifests, keys, or results over the network.</p><h2>Website</h2><p>The demo uses bundled sample data. Demo state stays in memory and is discarded when you leave.</p><h2>Contact</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> for privacy questions.</p></article>');
}
function terms() {
  return shell('<article class="legal"><p class="eyebrow">LEGAL / PLAIN WORDS</p><h1>Terms for using the checker</h1><p>Last updated August 28, 2026.</p><h2>License</h2><p>The core checker is MIT-licensed.</p><h2>No release guarantee</h2><p>Channel rules change. A passing report reduces known blockers but does not guarantee acceptance.</p><h2>Liability</h2><p>The software is provided without warranty. You remain responsible for signing, publishing, and protecting credentials.</p></article>');
}
function notFound() {
  return shell('<section class="not-found"><p class="error-code">404 / MISROUTED</p><h1>This package went to the wrong path</h1><p>The page does not exist. The checker has not changed any files.</p><a class="button primary" href="/" data-link>Return to the workbench</a></section>');
}

function navigate(path: string, replace = false, focusHeading = true) {
  const clean = path === '/' ? '/' : path.replace(/\/$/, '');
  const route = ['/', '/demo', '/privacy', '/terms'].includes(clean) ? clean : '/404';
  app.innerHTML = route === '/' ? home() : route === '/demo' ? demo() : route === '/privacy' ? privacy() : route === '/terms' ? terms() : notFound();
  document.title = titles[route];
  const canonical = 'https://installer-release-doctor.sociobot.in' + (route === '/404' ? clean : route);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
  bind();
  if (!replace) history.pushState({}, '', path);
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
      navigate(new URL(anchor.href).pathname);
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
    };
    matchMedia('(prefers-reduced-motion: reduce)').matches ? finish() : window.setTimeout(finish, 700);
  });
  if (location.pathname === '/') void loadRelease();
}

async function loadRelease() {
  const element = document.querySelector('#download-state');
  if (!element) return;
  try {
    const cached = JSON.parse(localStorage.getItem('release-cache:v1') || 'null');
    let release = cached && Date.now() - cached.saved < 3600000 ? cached.data : null;
    if (!release) {
      const response = await fetch('https://api.github.com/repos/B-Divyesh/sf-installer-release-doctor/releases?per_page=1');
      if (!response.ok) throw new Error('not published');
      const releases = await response.json();
      release = releases[0];
      if (!release) throw new Error('not published');
      localStorage.setItem('release-cache:v1', JSON.stringify({ saved: Date.now(), data: release }));
    }
    const choices = downloadChoices(release.assets as ReleaseAsset[], navigator.userAgent);
    const downloads = choices.map(function (choice) {
      return '<a class="button ' + (choice.primary ? 'primary' : 'secondary') + '" href="' + choice.asset.browser_download_url + '">' + choice.label + '</a>';
    }).join('');
    const macLabel = /Mac/i.test(navigator.userAgent) && choices.length ? '<p><strong>Choose your Mac:</strong></p>' : '';
    element.innerHTML = choices.length ? macLabel + '<div class="download-choices">' + downloads + '</div><p>Published ' + release.tag_name + '. SHA256SUMS is included.</p>' : '<p>Build ' + release.tag_name + ' is published. Choose an asset on the <a href="' + release.html_url + '">GitHub Release page.</a></p>';
  } catch {
    element.innerHTML = '<p><strong>Downloads are being published.</strong><br>Use the install command, or check the <a href="https://github.com/B-Divyesh/sf-installer-release-doctor/releases">GitHub Releases page.</a></p>';
  }
}

window.addEventListener('popstate', function () { navigate(location.pathname, true); });
navigate(location.pathname, true, false);
if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
