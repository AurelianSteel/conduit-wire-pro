/**
 * Transformer Sizing Calculator Types
 * Supports single-phase and three-phase transformer calculations per NEC 450
 */

/** Transformer phase type */
export type TransformerPhase = 'single' | 'three';

/** Common transformer KVA ratings */
export type TransformerSize = 5 | 10 | 15 | 25 | 37.5 | 50 | 75 | 100 | 150 | 200 | 300 | 500 | 750 | 1000;

/** Standard voltage levels */
export type VoltageLevel = 120 | 208 | 240 | 277 | 480 | 600;

/** Transformer input parameters */
export interface TransformerInput {
  /** Transformer KVA rating */
  kva: number;
  /** Primary voltage (input side) */
  primaryVoltage: VoltageLevel;
  /** Secondary voltage (output side) */
  secondaryVoltage: VoltageLevel;
  /** Single-phase or three-phase */
  phase: TransformerPhase;
  /** Transformer impedance percentage (typically 1.5% - 5%) */
  impedancePercent: number;
}

/** Transformer calculation results */
export interface TransformerResult {
  /** Primary full-load amps */
  primaryFLA: number;
  /** Secondary full-load amps */
  secondaryFLA: number;
  /** Primary overcurrent protection device size (amps) */
  primaryOCPD: number;
  /** Secondary overcurrent protection device size (amps) */
  secondaryOCPD: number;
  /** Estimated fault current at secondary */
  faultCurrent: number;
  /** Turns ratio (primary / secondary) */
  turnsRatio: number;
  /** Calculation notes and warnings */
  notes: string[];
}

/** Standard breaker sizes per NEC 240.6 */
export const STANDARD_BREAKER_SIZES: number[] = [
  15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200,
  225, 250, 300, 350, 400, 450, 500, 600, 700, 800, 1000, 1200, 1600, 2000,
  2500, 3000, 4000, 5000, 6000,
];

/** Common transformer KVA ratings for dropdown */
export const COMMON_KVA_RATINGS: TransformerSize[] = [
  5, 10, 15, 25, 37.5, 50, 75, 100, 150, 200, 300, 500, 750, 1000,
];

/** Standard system voltages */
export const STANDARD_VOLTAGES: VoltageLevel[] = [
  120, 208, 240, 277, 480, 600,
];

/** Typical impedance percentages by transformer size */
export const TYPICAL_IMPEDANCE: Record<number, number> = {
  5: 2.0,
  10: 2.0,
  15: 1.8,
  25: 1.6,
  37.5: 1.5,
  50: 1.5,
  75: 1.4,
  100: 1.4,
  150: 1.3,
  200: 1.3,
  300: 1.2,
  500: 1.1,
  750: 1.0,
  1000: 1.0,
};

/** Voltage descriptions for UI */
export const VOLTAGE_DESCRIPTIONS: Record<VoltageLevel, string> = {
  120: '120V (Single-Phase)',
  208: '208V (3-Phase Wye)',
  240: '240V (Single or 3-Phase)',
  277: '277V (3-Phase Wye)',
  480: '480V (3-Phase)',
  600: '600V (3-Phase, Canada)',
};

/** NEC 450.3 protection requirements */
export interface ProtectionRequirements {
  /** Maximum primary protection as percentage of FLA */
  maxPrimaryProtectionPercent: number;
  /** Maximum secondary protection as percentage of FLA */
  maxSecondaryProtectionPercent: number;
  /** Note about protection requirements */
  notes: string;
}

/** Get protection requirements based on transformer specs */
export function getProtectionRequirements(kva: number, voltage: number): ProtectionRequirements {
  // Primary protection per NEC 450.3(B):
  // For transformers > 600V primary: max 300% of FLA
  // For transformers <= 600V primary with impedance <= 6%: max 125% of FLA
  // For transformers <= 600V primary with impedance > 6%: max 250% of FLA

  if (voltage > 600) {
    return {
      maxPrimaryProtectionPercent: 300,
      maxSecondaryProtectionPercent: 125,
      notes: 'Primary voltage > 600V: Max 300% protection per NEC 450.3(A)',
    };
  }

  return {
    maxPrimaryProtectionPercent: 125,
    maxSecondaryProtectionPercent: 125,
    notes: 'Primary voltage ≤ 600V: Max 125% protection per NEC 450.3(B)',
  };
}
