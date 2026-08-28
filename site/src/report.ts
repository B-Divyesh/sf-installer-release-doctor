export type Level = 'pass' | 'warning' | 'fail';
export interface Finding { channel: string; check: string; level: Level; message: string; repair?: string }
export interface DemoReport { product: string; release: string; findings: Finding[] }

export const sampleReport: DemoReport = {
  product: 'Acme CLI', release: '1.4.0', findings: [
    { channel: 'winget', check: 'artifact', level: 'pass', message: 'Windows ZIP found.' },
    { channel: 'winget', check: 'archive safety', level: 'pass', message: 'Archive has 2 safe entries.' },
    { channel: 'winget', check: 'archive layout', level: 'pass', message: 'Binary and license found.' },
    { channel: 'winget', check: 'required file', level: 'pass', message: 'Archive contains LICENSE.' },
    { channel: 'winget', check: 'signature', level: 'pass', message: 'Detached signature found.' },
    { channel: 'winget', check: 'SBOM', level: 'pass', message: 'CycloneDX companion found.' },
    { channel: 'winget', check: 'provenance', level: 'fail', message: 'Provenance companion is missing.', repair: 'Create acme-cli_1.4.0_windows_x86_64.zip.intoto.jsonl beside the artifact.' },
    { channel: 'winget', check: 'upgrade path', level: 'pass', message: 'Upgrade advances 1.3.2 to 1.4.0.' },
    { channel: 'winget', check: 'checksum', level: 'pass', message: 'SHA-256 matches SHA256SUMS.' },
    { channel: 'winget', check: 'package ID', level: 'pass', message: 'Package identifier is com.acme.cli.' },
    { channel: 'winget', check: 'architecture', level: 'pass', message: 'Architecture is x86_64.' }
  ]
};

export function channelStatus(report: DemoReport, channel: string): Level {
  const list = report.findings.filter((item) => item.channel === channel);
  return list.some((item) => item.level === 'fail') ? 'fail' : list.some((item) => item.level === 'warning') ? 'warning' : 'pass';
}
