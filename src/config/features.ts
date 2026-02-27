/**
 * Feature Flags TypeScript Helpers
 * Dr. Stone Build — Iterative Dev Workflow
 * 
 * Usage:
 *   import { isEnabled, getVersion, isBetaUser } from './features';
 *   
 *   if (isEnabled('conduitFill')) {
 *     // Show conduit fill calculator
 *   }
 */

import featuresData from './features.json';

// Types
export type CalculatorId = 
  | 'conduitFill'
  | 'voltageDrop' 
  | 'boxFill'
  | 'wireAmpacity'
  | 'motorCircuit'
  | 'dwellingLoad'
  | 'pipeBending'
  | 'faultCurrent';

export type FeatureId =
  | 'cloudSync'
  | 'projectFolders'
  | 'pdfExport'
  | 'darkMode'
  | 'offlineMode'
  | 'unitConversion';

export type FeatureFlagId = CalculatorId | FeatureId;

export interface FeatureFlag {
  enabled: boolean;
  version: string;
  name: string;
  description: string;
  betaOnly: boolean;
  minAppVersion: string;
}

export interface FeaturesConfig {
  _meta: {
    version: string;
    description: string;
    lastUpdated: string;
  };
  calculators: Record<CalculatorId, FeatureFlag>;
  features: Record<FeatureId, FeatureFlag>;
  betaUsers: string[];
}

// Runtime state (can be overridden)
let currentUserEmail: string | null = null;
let appVersionOverride: string | null = null;
let betaModeOverride: boolean | null = null;

/**
 * Set the current user for beta checks
 */
export function setCurrentUser(email: string): void {
  currentUserEmail = email.toLowerCase().trim();
}

/**
 * Set app version override (for testing)
 */
export function setAppVersion(version: string): void {
  appVersionOverride = version;
}

/**
 * Enable/disable beta mode (for testing)
 */
export function setBetaMode(enabled: boolean): void {
  betaModeOverride = enabled;
}

/**
 * Get current app version
 */
function getAppVersion(): string {
  // In real app, this would come from app.json or Constants
  return appVersionOverride || '1.0.0';
}

/**
 * Check if we're in beta mode
 */
function isBetaMode(): boolean {
  if (betaModeOverride !== null) {
    return betaModeOverride;
  }
  
  // Check if current user is a beta user
  if (currentUserEmail && featuresData.betaUsers.includes(currentUserEmail)) {
    return true;
  }
  
  // Could also check app version suffix
  const version = getAppVersion();
  return version.includes('-beta') || version.includes('-alpha');
}

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
  // Strip pre-release suffixes for comparison
  const cleanV1 = v1.split('-')[0];
  const cleanV2 = v2.split('-')[0];
  
  const parts1 = cleanV1.split('.').map(Number);
  const parts2 = cleanV2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const a = parts1[i] || 0;
    const b = parts2[i] || 0;
    
    if (a < b) return -1;
    if (a > b) return 1;
  }
  
  return 0;
}

/**
 * Check if app version meets minimum requirement
 */
function meetsMinVersion(minVersion: string): boolean {
  const currentVersion = getAppVersion();
  return compareVersions(currentVersion, minVersion) >= 0;
}

/**
 * Check if a feature flag is enabled
 * 
 * @param flagId - The feature flag ID
 * @param options - Optional check options
 * @returns boolean indicating if feature is enabled
 */
export function isEnabled(
  flagId: FeatureFlagId,
  options?: { ignoreBeta?: boolean; ignoreVersion?: boolean }
): boolean {
  const config = featuresData as FeaturesConfig;
  
  // Find the flag
  let flag: FeatureFlag | undefined;
  
  if (flagId in config.calculators) {
    flag = config.calculators[flagId as CalculatorId];
  } else if (flagId in config.features) {
    flag = config.features[flagId as FeatureId];
  }
  
  if (!flag) {
    console.warn(`Feature flag not found: ${flagId}`);
    return false;
  }
  
  // Check if enabled in config
  if (!flag.enabled) {
    // Beta-only features might still be enabled for beta users
    if (!flag.betaOnly || !isBetaMode()) {
      return false;
    }
  }
  
  // Check beta-only restriction
  if (flag.betaOnly && !options?.ignoreBeta && !isBetaMode()) {
    return false;
  }
  
  // Check minimum app version
  if (!options?.ignoreVersion && !meetsMinVersion(flag.minAppVersion)) {
    return false;
  }
  
  return true;
}

/**
 * Get the version of a feature/calculator
 */
export function getVersion(flagId: FeatureFlagId): string | null {
  const config = featuresData as FeaturesConfig;
  
  if (flagId in config.calculators) {
    return config.calculators[flagId as CalculatorId].version;
  }
  
  if (flagId in config.features) {
    return config.features[flagId as FeatureId].version;
  }
  
  return null;
}

/**
 * Get feature flag details
 */
export function getFeature(flagId: FeatureFlagId): FeatureFlag | null {
  const config = featuresData as FeaturesConfig;
  
  if (flagId in config.calculators) {
    return config.calculators[flagId as CalculatorId];
  }
  
  if (flagId in config.features) {
    return config.features[flagId as FeatureId];
  }
  
  return null;
}

/**
 * Check if current user is a beta user
 */
export function isBetaUser(email?: string): boolean {
  const checkEmail = email?.toLowerCase().trim() || currentUserEmail;
  
  if (!checkEmail) {
    return isBetaMode();
  }
  
  return featuresData.betaUsers.includes(checkEmail);
}

/**
 * Get all enabled calculators
 */
export function getEnabledCalculators(): Array<{ id: CalculatorId; config: FeatureFlag }> {
  const config = featuresData as FeaturesConfig;
  
  return (Object.entries(config.calculators) as Array<[CalculatorId, FeatureFlag]>)
    .filter(([id]) => isEnabled(id))
    .map(([id, config]) => ({ id, config }));
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): Array<{ id: FeatureId; config: FeatureFlag }> {
  const config = featuresData as FeaturesConfig;
  
  return (Object.entries(config.features) as Array<[FeatureId, FeatureFlag]>)
    .filter(([id]) => isEnabled(id))
    .map(([id, config]) => ({ id, config }));
}

/**
 * Get all feature flags for debugging
 */
export function getAllFlags(): {
  calculators: Record<CalculatorId, FeatureFlag>;
  features: Record<FeatureId, FeatureFlag>;
} {
  return {
    calculators: featuresData.calculators as Record<CalculatorId, FeatureFlag>,
    features: featuresData.features as Record<FeatureId, FeatureFlag>,
  };
}

/**
 * Debug helper - print feature status
 */
export function debugFlags(): void {
  const all = getAllFlags();
  
  console.log('=== Feature Flags Debug ===');
  console.log(`App Version: ${getAppVersion()}`);
  console.log(`Beta Mode: ${isBetaMode()}`);
  console.log(`Current User: ${currentUserEmail || 'not set'}`);
  console.log('');
  
  console.log('Calculators:');
  Object.entries(all.calculators).forEach(([id, flag]) => {
    const enabled = isEnabled(id as CalculatorId);
    const status = enabled ? '✅' : '❌';
    console.log(`  ${status} ${id}: ${flag.name} (v${flag.version})`);
  });
  
  console.log('');
  console.log('Features:');
  Object.entries(all.features).forEach(([id, flag]) => {
    const enabled = isEnabled(id as FeatureId);
    const status = enabled ? '✅' : '❌';
    console.log(`  ${status} ${id}: ${flag.name} (v${flag.version})`);
  });
}

export default {
  isEnabled,
  getVersion,
  getFeature,
  isBetaUser,
  getEnabledCalculators,
  getEnabledFeatures,
  getAllFlags,
  debugFlags,
  setCurrentUser,
  setAppVersion,
  setBetaMode,
};
