export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
}

export interface DownloadChoice {
  label: string;
  asset: ReleaseAsset;
  primary: boolean;
}

function named(assets: ReleaseAsset[], part: string) {
  return assets.find(function (asset) { return asset.name.toLowerCase().includes(part); });
}

export function downloadChoices(assets: ReleaseAsset[], userAgent: string): DownloadChoice[] {
  if (/Windows/i.test(userAgent)) {
    const asset = named(assets, 'windows-x86_64.zip');
    return asset ? [{ label: `Download ${asset.name}`, asset, primary: true }] : [];
  }
  if (/Mac/i.test(userAgent)) {
    const arm = named(assets, 'darwin-aarch64.tar.gz');
    const intel = named(assets, 'darwin-x86_64.tar.gz');
    return [
      ...(arm ? [{ label: 'Download for Apple silicon', asset: arm, primary: false }] : []),
      ...(intel ? [{ label: 'Download for Intel Mac', asset: intel, primary: false }] : [])
    ];
  }
  const asset = named(assets, 'linux-x86_64.tar.gz');
  return asset ? [{ label: `Download ${asset.name}`, asset, primary: true }] : [];
}
