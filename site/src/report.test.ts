import { describe, expect, it } from 'vitest';
import { channelStatus, sampleReport } from './report';
describe('channel matrix', () => {
  it('marks a channel blocked when one finding fails', () => expect(channelStatus(sampleReport, 'winget')).toBe('fail'));
  it('marks all-passing results ready', () => expect(channelStatus({ ...sampleReport, findings: sampleReport.findings.filter((item) => item.level === 'pass') }, 'winget')).toBe('pass'));
});
