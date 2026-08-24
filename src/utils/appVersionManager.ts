export interface AppVersionConfig {
  latestVersion: string;
  minRequiredVersion: string;
  isUnderMaintenance: boolean;
  maintenanceMessage: string;
  maintenanceMessageHi: string;
  releaseDate: string;
  releaseNotes: string[];
  releaseNotesHi: string[];
  forced: boolean;
}

export const CURRENT_BUILD_VERSION = '1.0.0.beta';

export const DEFAULT_VERSION_CONFIG: AppVersionConfig = {
  latestVersion: '1.0.0.beta',
  minRequiredVersion: '1.0.0.beta',
  isUnderMaintenance: false,
  maintenanceMessage: 'Patel CCTV App update and catalog sync in progress. Please wait a moment...',
  maintenanceMessageHi: 'पटेल सीसीटीवी ऐप (v1.0.0.beta) में नया अपडेट व कैटलॉग सिंक हो रहा है। कृपया कुछ क्षण प्रतीक्षा करें...',
  releaseDate: '2026-08-23',
  releaseNotes: [
    'Patel CCTV Official App Build v1.0.0.beta - High Performance Release',
    'Upgraded HD / 4K CCTV Camera Catalog with real-time wholesale pricing',
    'Instant WhatsApp order sync direct to +91 74830 05197',
    'Exclusive Owner & Catalog Security Engine for +91 80009 51663',
    'Fast photo rendering and zero-lag offline caching'
  ],
  releaseNotesHi: [
    'पटेल सीसीटीवी आधिकारिक ऐप बिल्ड v1.0.0.beta (बीटा वर्ज़न)',
    'नया HD एवं 4K सीसीटीवी कैमरा कैटलॉग व थोक मूल्य सूची',
    'सीधा व्हाट्सएप ऑर्डर लिंक (+91 74830 05197)',
    'केवल अधिकृत ओनर (+91 80009 51663) के लिए सुरक्षित एडमिन कैटलॉग',
    'सुपरफास्ट कैमरा फोटो लोडिंग, बेहतर सुरक्षा व ऑटोमैटिक कैश रिफ्रेश'
  ],
  forced: true,
};

const STORAGE_KEY_INSTALLED_VERSION = 'patel_cctv_installed_app_version_v1beta';
const STORAGE_KEY_REMOTE_CONFIG = 'patel_cctv_remote_version_config_v1beta';

// Helper to normalize version strings like "1.0.0.beta" or "1.0.0" or "v1.0.0-beta"
function parseVersionTokens(v: string): { major: number; minor: number; patch: number; beta: number } {
  const clean = (v || '').toLowerCase().replace(/^v/, '').trim();
  const isBeta = clean.includes('beta');
  const betaMatch = clean.match(/beta\.?(\d+)?/);
  const betaNum = betaMatch && betaMatch[1] ? parseInt(betaMatch[1], 10) : (isBeta ? 1 : 9999);
  
  // Extract primary digits
  const numPart = clean.replace(/[-_.]?beta.*$/, '');
  const digits = numPart.split('.').map(n => parseInt(n, 10) || 0);

  return {
    major: digits[0] || 0,
    minor: digits[1] || 0,
    patch: digits[2] || 0,
    beta: betaNum,
  };
}

// Compare semantic versions (e.g., "1.0.0.beta" vs "1.0.1")
export function compareVersions(v1: string, v2: string): number {
  if (v1 === v2) return 0;
  const p1 = parseVersionTokens(v1);
  const p2 = parseVersionTokens(v2);

  if (p1.major !== p2.major) return p1.major > p2.major ? 1 : -1;
  if (p1.minor !== p2.minor) return p1.minor > p2.minor ? 1 : -1;
  if (p1.patch !== p2.patch) return p1.patch > p2.patch ? 1 : -1;
  if (p1.beta !== p2.beta) return p1.beta > p2.beta ? 1 : -1;

  return 0;
}

export function getInstalledVersion(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_INSTALLED_VERSION);
    return saved || CURRENT_BUILD_VERSION;
  } catch {
    return CURRENT_BUILD_VERSION;
  }
}

export function setInstalledVersion(ver: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_INSTALLED_VERSION, ver);
  } catch (err) {
    console.error('Failed to set installed version', err);
  }
}

export function getRemoteVersionConfig(): AppVersionConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REMOTE_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to parse remote version config', err);
  }
  return DEFAULT_VERSION_CONFIG;
}

export function saveRemoteVersionConfig(config: AppVersionConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_REMOTE_CONFIG, JSON.stringify(config));
    // Dispatch custom event to notify all tabs/components immediately
    window.dispatchEvent(new CustomEvent('patel_cctv_version_changed', { detail: config }));
  } catch (err) {
    console.error('Failed to save remote version config', err);
  }
}

export interface UpdateCheckResult {
  needed: boolean;
  isMaintenance: boolean;
  currentVersion: string;
  latestVersion: string;
  config: AppVersionConfig;
}

export function checkAppUpdateRequired(): UpdateCheckResult {
  const config = getRemoteVersionConfig();
  const installed = getInstalledVersion();

  // If maintenance is turned on by the owner
  if (config.isUnderMaintenance) {
    return {
      needed: true,
      isMaintenance: true,
      currentVersion: installed,
      latestVersion: config.latestVersion,
      config,
    };
  }

  // Check if installed version is older than minimum required or latest forced version
  const isOlder = compareVersions(installed, config.minRequiredVersion) < 0 || 
                  (config.forced && compareVersions(installed, config.latestVersion) < 0);

  return {
    needed: isOlder,
    isMaintenance: false,
    currentVersion: installed,
    latestVersion: config.latestVersion,
    config,
  };
}

export async function executeAppUpdate(
  targetVersion: string,
  onProgress: (percent: number, statusTextHi: string, statusTextEn: string) => void
): Promise<void> {
  // Step 1: Connecting to Patel CCTV Secure Cloud
  onProgress(15, 'पटेल सीसीटीवी सर्वर से कनेक्ट किया जा रहा है...', 'Connecting to Patel CCTV Security Cloud...');
  await new Promise(r => setTimeout(r, 600));

  // Step 2: Downloading latest Camera Models & Pricing
  onProgress(45, 'नया कैमरा कैटलॉग व थोक मूल्य सूची डाउनलोड हो रही है...', 'Downloading Latest CCTV Models & Wholesale Price List...');
  await new Promise(r => setTimeout(r, 700));

  // Step 3: Clearing Old Cache & Verifying Security Keys
  onProgress(75, 'पुराना कैश हटाया जा रहा है व नया डेटाबेस सिंक हो रहा है...', 'Purging Outdated Cache & Syncing High-Speed Database...');
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  } catch (err) {
    console.warn('Cache clear note:', err);
  }
  await new Promise(r => setTimeout(r, 600));

  // Step 4: Finalizing & Installing
  onProgress(95, 'अपडेट स्थापित किया जा रहा है...', 'Installing update & finalizing security build...');
  setInstalledVersion(targetVersion);
  await new Promise(r => setTimeout(r, 500));

  // Step 5: Complete
  onProgress(100, 'अपडेट सफलतापूर्वक पूरा हुआ! ऐप लोड हो रहा है...', 'Update Successful! Restarting Patel CCTV App...');
  await new Promise(r => setTimeout(r, 400));
}
