/**
 * Fault Current Calculator Types
 * 
 * Calculates available fault current at transformer secondary or panel locations.
 * Used for determining required SCCR (Short Circuit Current Rating) per NEC 110.9, 110.10
 */

export type Phase = 'single' | 'three';
export type ConductorMaterial = 'copper' | 'aluminum';

export interface FaultCurrentInput {
  /** Transformer kVA rating */
  kva: number;
  /** Primary voltage (e.g., 12470, 480, 240) */
  primaryVoltage: number;
  /** Secondary voltage (e.g., 480, 208, 240, 277) */
  secondaryVoltage: number;
  /** Transformer % impedance (typically 1.5-5.0) */
  impedancePercent: number;
  /** Single or three phase */
  phase: Phase;
  /** Distance from transformer to calculation point (feet) */
  conductorLength?: number;
  /** Conductor size (AWG or kcmil: '4', '3/0', '250', etc.) */
  conductorSize?: string;
  /** Conductor material */
  conductorType?: ConductorMaterial;
  /** Include motor contribution to fault current */
  includeMotorContribution?: boolean;
  /** Total motor HP on system (for contribution calc) */
  motorHp?: number;
}

export interface ConductorImpedance {
  /** Resistance in ohms per 1000ft */
  r: number;
  /** Reactance in ohms per 1000ft */
  x: number;
  /** X/R ratio */
  xOverR: number;
}

export interface FaultCurrentResult {
  /** Transformer full load amps */
  transformerFLA: number;
  /** Theoretical fault current at transformer terminals (A) */
  transformerFaultCurrent: number;
  /** Conductor impedance per 1000ft (if provided) */
  conductorImpedance?: ConductorImpedance;
  /** Total conductor impedance at given length (ohms) */
  totalConductorImpedance?: number;
  /** Fault current at calculation point (A) */
  faultCurrentAtPoint: number;
  /** Motor contribution to fault current (A) */
  motorContribution: number;
  /** Total available fault current (A) - includes motor contribution */
  totalFaultCurrent: number;
  /** Recommended SCCR rating (e.g., "10kA", "22kA", "65kA") */
  sccrRequired: string;
  /** Safety margin (typical SCCR - calculated fault) / typical SCCR */
  safetyMargin: number;
}

export interface TransformerConfig {
  kva: number;
  impedancePercent: number;
  phase: Phase;
  primaryVoltage: number;
  secondaryVoltage: number;
}

/** Common transformer kVA ratings */
export const COMMON_KVA_RATINGS = [
  15, 25, 37.5, 50, 75, 100, 150, 167, 225, 300, 500, 750, 1000, 1500, 2000, 2500
];

/** Common transformer impedances by kVA range */
export const TYPICAL_IMPEDANCES: { maxKva: number; impedance: number }[] = [
  { maxKva: 150, impedance: 2.0 },
  { maxKva: 500, impedance: 3.0 },
  { maxKva: 1000, impedance: 4.0 },
  { maxKva: 2500, impedance: 5.0 },
];

/** Standard SCCR ratings per UL 508A/UL 508C */
export const STANDARD_SCCR_RATINGS = [10000, 14000, 22000, 42000, 65000, 100000, 150000, 200000];
