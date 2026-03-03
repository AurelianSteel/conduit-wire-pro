/**
 * Transformer Sizing Calculator Service
 * Calculates transformer FLA, OCPD sizing, and fault current per NEC 450
 */

import {
  TransformerInput,
  TransformerResult,
  TransformerPhase,
  VoltageLevel,
  STANDARD_BREAKER_SIZES,
  TYPICAL_IMPEDANCE,
  getProtectionRequirements,
} from '../types/transformer';

const SQRT3 = 1.73205080757;

/**
 * Round to 2 decimal places for amps display
 */
function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Find the next standard breaker size up from the calculated value
 * Per NEC 240.6 standard ampere ratings
 */
export function getNextStandardBreakerSize(amps: number): number {
  // Find the first standard size that is >= the calculated value
  const nextSize = STANDARD_BREAKER_SIZES.find(size => size >= amps);
  if (nextSize) {
    return nextSize;
  }
  // If larger than all standard sizes, round up to nearest 100
  return Math.ceil(amps / 100) * 100;
}

/**
 * Calculate KVA from amps and voltage
 * @param amps - Current in amperes
 * @param volts - Voltage in volts
 * @param phase - 'single' or 'three' phase
 * @returns KVA rating
 */
export function calculateKVA(
  amps: number,
  volts: number,
  phase: TransformerPhase
): number {
  if (amps <= 0 || volts <= 0) {
    throw new Error('Amps and volts must be greater than 0');
  }

  if (phase === 'single') {
    return (volts * amps) / 1000;
  } else {
    return (volts * amps * SQRT3) / 1000;
  }
}

/**
 * Calculate full-load amps (FLA) from KVA and voltage
 * @param kva - Transformer KVA rating
 * @param volts - Voltage in volts
 * @param phase - 'single' or 'three' phase
 * @returns Full-load amps
 */
export function calculateFLA(
  kva: number,
  volts: number,
  phase: TransformerPhase
): number {
  if (kva <= 0 || volts <= 0) {
    throw new Error('KVA and volts must be greater than 0');
  }

  if (phase === 'single') {
    return (kva * 1000) / volts;
  } else {
    return (kva * 1000) / (volts * SQRT3);
  }
}

/**
 * Calculate fault current at transformer secondary
 * @param fla - Full-load amps
 * @param impedancePercent - Transformer impedance percentage (e.g., 2.5)
 * @returns Estimated fault current in amps
 */
export function calculateFaultCurrent(
  fla: number,
  impedancePercent: number
): number {
  if (fla <= 0 || impedancePercent <= 0) {
    throw new Error('FLA and impedance must be greater than 0');
  }

  if (impedancePercent > 20) {
    throw new Error('Impedance percentage seems unusually high (>20%)');
  }

  // Fault current = FLA / (impedance / 100)
  return fla / (impedancePercent / 100);
}

/**
 * Size overcurrent protection device per NEC 450.3
 * @param fla - Full-load amps
 * @param maxPercent - Maximum protection percentage (typically 125%)
 * @returns Standard breaker size in amps
 */
export function sizeOCPD(fla: number, maxPercent: number = 125): number {
  if (fla <= 0) {
    throw new Error('FLA must be greater than 0');
  }

  // Calculate maximum allowed protection
  const maxProtection = fla * (maxPercent / 100);

  // Get next standard breaker size
  return getNextStandardBreakerSize(maxProtection);
}

/**
 * Get typical impedance for a transformer size
 * @param kva - Transformer KVA rating
 * @returns Typical impedance percentage
 */
export function getTypicalImpedance(kva: number): number {
  // Find closest standard size
  const standardSizes = Object.keys(TYPICAL_IMPEDANCE)
    .map(Number)
    .sort((a, b) => a - b);

  // Find the closest size
  let closestSize = standardSizes[0];
  let minDiff = Math.abs(kva - closestSize);

  for (const size of standardSizes) {
    const diff = Math.abs(kva - size);
    if (diff < minDiff) {
      minDiff = diff;
      closestSize = size;
    }
  }

  return TYPICAL_IMPEDANCE[closestSize] || 1.5;
}

/**
 * Calculate turns ratio
 * @param primaryVoltage - Primary voltage
 * @param secondaryVoltage - Secondary voltage
 * @returns Turns ratio (primary / secondary)
 */
export function calculateTurnsRatio(
  primaryVoltage: number,
  secondaryVoltage: number
): number {
  if (secondaryVoltage <= 0) {
    throw new Error('Secondary voltage must be greater than 0');
  }
  return primaryVoltage / secondaryVoltage;
}

/**
 * Main transformer calculation function
 * Calculates all transformer specs per NEC 450
 * @param input - Transformer input parameters
 * @returns Complete transformer calculation results
 */
export function calculateTransformerSpecs(input: TransformerInput): TransformerResult {
  const { kva, primaryVoltage, secondaryVoltage, phase, impedancePercent } = input;

  // Validate inputs
  if (kva <= 0) {
    throw new Error('Transformer KVA must be greater than 0');
  }
  if (primaryVoltage <= 0 || secondaryVoltage <= 0) {
    throw new Error('Voltages must be greater than 0');
  }
  if (impedancePercent <= 0 || impedancePercent > 20) {
    throw new Error('Impedance percentage must be between 0.1% and 20%');
  }

  // Calculate FLA for primary and secondary
  const primaryFLA = calculateFLA(kva, primaryVoltage, phase);
  const secondaryFLA = calculateFLA(kva, secondaryVoltage, phase);

  // Get protection requirements
  const primaryProtection = getProtectionRequirements(kva, primaryVoltage);
  const secondaryProtection = getProtectionRequirements(kva, secondaryVoltage);

  // Size OCPDs
  const primaryOCPD = sizeOCPD(primaryFLA, primaryProtection.maxPrimaryProtectionPercent);
  const secondaryOCPD = sizeOCPD(secondaryFLA, secondaryProtection.maxSecondaryProtectionPercent);

  // Calculate fault current
  const faultCurrent = calculateFaultCurrent(secondaryFLA, impedancePercent);

  // Calculate turns ratio
  const turnsRatio = calculateTurnsRatio(primaryVoltage, secondaryVoltage);

  // Generate notes
  const notes: string[] = [];

  // Voltage ratio check
  if (primaryVoltage < secondaryVoltage) {
    notes.push('⚠️ Step-up transformer: Primary voltage is lower than secondary.');
  } else if (primaryVoltage > secondaryVoltage) {
    notes.push('✓ Step-down transformer: Primary voltage is higher than secondary.');
  } else {
    notes.push('ℹ️ Isolation transformer: Primary and secondary voltages are equal.');
  }

  // OCPD sizing notes
  const primaryPercent = ((primaryOCPD / primaryFLA) * 100).toFixed(1);
  const secondaryPercent = ((secondaryOCPD / secondaryFLA) * 100).toFixed(1);
  notes.push(`Primary protection: ${primaryOCPD}A (${primaryPercent}% of FLA)`);
  notes.push(`Secondary protection: ${secondaryOCPD}A (${secondaryPercent}% of FLA)`);

  // Protection requirement notes
  notes.push(primaryProtection.notes);

  // Fault current warning
  if (faultCurrent > 10000) {
    notes.push(`⚠️ High fault current: ${Math.round(faultCurrent).toLocaleString()}A - Ensure AIC rating is sufficient.`);
  }

  // Impedance note
  const typicalZ = getTypicalImpedance(kva);
  if (Math.abs(impedancePercent - typicalZ) > 1) {
    notes.push(`ℹ️ Typical impedance for ${kva} KVA is ~${typicalZ}%. Verify actual transformer specs.`);
  }

  // Three-phase note
  if (phase === 'three') {
    notes.push('Three-phase transformer: Line-to-line voltages used for calculations.');
  }

  return {
    primaryFLA: roundToTwoDecimals(primaryFLA),
    secondaryFLA: roundToTwoDecimals(secondaryFLA),
    primaryOCPD,
    secondaryOCPD,
    faultCurrent: roundToTwoDecimals(faultCurrent),
    turnsRatio: roundToTwoDecimals(turnsRatio),
    notes,
  };
}

/**
 * Calculate minimum transformer size needed for a given load
 * @param loadAmps - Load current in amps
 * @param voltage - System voltage
 * @param phase - 'single' or 'three' phase
 * @param diversityFactor - Optional diversity factor (default 1.25 for 125%)
 * @returns Minimum KVA rating
 */
export function calculateMinimumTransformerSize(
  loadAmps: number,
  voltage: number,
  phase: TransformerPhase,
  diversityFactor: number = 1.25
): number {
  if (loadAmps <= 0 || voltage <= 0) {
    throw new Error('Load amps and voltage must be greater than 0');
  }

  const baseKVA = calculateKVA(loadAmps, voltage, phase);
  return roundToTwoDecimals(baseKVA * diversityFactor);
}

/**
 * Format amps with units
 * @param amps - Current in amperes
 * @returns Formatted string (e.g., "125.5 A")
 */
export function formatAmps(amps: number): string {
  return `${amps.toFixed(2)} A`;
}

/**
 * Format KVA with units
 * @param kva - KVA rating
 * @returns Formatted string (e.g., "75 KVA")
 */
export function formatKVA(kva: number): string {
  return `${kva} KVA`;
}
