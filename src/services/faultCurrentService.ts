/**
 * Fault Current Calculation Service
 * 
 * Calculates available fault current per IEEE standards and NEC requirements.
 * Used for equipment SCCR (Short Circuit Current Rating) determination.
 */

import {
  FaultCurrentInput,
  FaultCurrentResult,
  ConductorImpedance,
  Phase,
  ConductorMaterial,
  STANDARD_SCCR_RATINGS,
} from '../types/faultCurrent';

/**
 * Conductor impedance data per NEC Chapter 9, Table 9
 * Values in ohms per 1000ft at 75°C
 */
const CONDUCTOR_IMPEDANCE: Record<string, Record<ConductorMaterial, ConductorImpedance>> = {
  '14': {
    copper: { r: 3.07, x: 0.058, xOverR: 0.019 },
    aluminum: { r: 5.06, x: 0.058, xOverR: 0.011 },
  },
  '12': {
    copper: { r: 1.93, x: 0.054, xOverR: 0.028 },
    aluminum: { r: 3.18, x: 0.054, xOverR: 0.017 },
  },
  '10': {
    copper: { r: 1.21, x: 0.050, xOverR: 0.041 },
    aluminum: { r: 2.00, x: 0.050, xOverR: 0.025 },
  },
  '8': {
    copper: { r: 0.764, x: 0.052, xOverR: 0.068 },
    aluminum: { r: 1.26, x: 0.052, xOverR: 0.041 },
  },
  '6': {
    copper: { r: 0.491, x: 0.051, xOverR: 0.104 },
    aluminum: { r: 0.808, x: 0.051, xOverR: 0.063 },
  },
  '4': {
    copper: { r: 0.308, x: 0.048, xOverR: 0.156 },
    aluminum: { r: 0.508, x: 0.048, xOverR: 0.094 },
  },
  '2': {
    copper: { r: 0.194, x: 0.047, xOverR: 0.242 },
    aluminum: { r: 0.320, x: 0.047, xOverR: 0.147 },
  },
  '1': {
    copper: { r: 0.154, x: 0.046, xOverR: 0.299 },
    aluminum: { r: 0.254, x: 0.046, xOverR: 0.181 },
  },
  '1/0': {
    copper: { r: 0.122, x: 0.045, xOverR: 0.369 },
    aluminum: { r: 0.201, x: 0.045, xOverR: 0.224 },
  },
  '2/0': {
    copper: { r: 0.0967, x: 0.044, xOverR: 0.455 },
    aluminum: { r: 0.160, x: 0.044, xOverR: 0.275 },
  },
  '3/0': {
    copper: { r: 0.0766, x: 0.043, xOverR: 0.561 },
    aluminum: { r: 0.127, x: 0.043, xOverR: 0.339 },
  },
  '4/0': {
    copper: { r: 0.0608, x: 0.042, xOverR: 0.691 },
    aluminum: { r: 0.101, x: 0.042, xOverR: 0.416 },
  },
  '250': {
    copper: { r: 0.0515, x: 0.041, xOverR: 0.796 },
    aluminum: { r: 0.0851, x: 0.041, xOverR: 0.482 },
  },
  '300': {
    copper: { r: 0.0429, x: 0.040, xOverR: 0.932 },
    aluminum: { r: 0.0709, x: 0.040, xOverR: 0.564 },
  },
  '350': {
    copper: { r: 0.0367, x: 0.039, xOverR: 1.063 },
    aluminum: { r: 0.0607, x: 0.039, xOverR: 0.643 },
  },
  '400': {
    copper: { r: 0.0321, x: 0.038, xOverR: 1.184 },
    aluminum: { r: 0.0531, x: 0.038, xOverR: 0.716 },
  },
  '500': {
    copper: { r: 0.0258, x: 0.037, xOverR: 1.434 },
    aluminum: { r: 0.0427, x: 0.037, xOverR: 0.867 },
  },
  '600': {
    copper: { r: 0.0216, x: 0.036, xOverR: 1.667 },
    aluminum: { r: 0.0357, x: 0.036, xOverR: 1.008 },
  },
  '750': {
    copper: { r: 0.0173, x: 0.035, xOverR: 2.023 },
    aluminum: { r: 0.0286, x: 0.035, xOverR: 1.224 },
  },
  '1000': {
    copper: { r: 0.0130, x: 0.034, xOverR: 2.615 },
    aluminum: { r: 0.0215, x: 0.034, xOverR: 1.581 },
  },
};

/**
 * Calculate transformer full load amps
 */
export function calculateTransformerFLA(
  kva: number,
  voltage: number,
  phase: Phase
): number {
  if (phase === 'three') {
    return (kva * 1000) / (Math.sqrt(3) * voltage);
  } else {
    return (kva * 1000) / voltage;
  }
}

/**
 * Calculate theoretical fault current at transformer terminals
 * Per IEEE C57.12.00 and standard electrical engineering practice
 */
export function calculateTransformerFaultCurrent(
  fla: number,
  impedancePercent: number
): number {
  if (impedancePercent <= 0) {
    throw new Error('Transformer impedance must be greater than 0%');
  }
  return fla / (impedancePercent / 100);
}

/**
 * Get conductor impedance data
 */
export function getConductorImpedance(
  size: string,
  material: ConductorMaterial
): ConductorImpedance | null {
  const normalizedSize = size.toString().trim();
  const data = CONDUCTOR_IMPEDANCE[normalizedSize];
  if (!data) return null;
  return data[material];
}

/**
 * Calculate motor contribution to fault current
 * Motors act as generators during faults, contributing approximately 4× FLA
 * Simplified calculation: 0.5 HP ≈ 1A contribution at 480V
 */
export function calculateMotorContribution(
  motorHp: number,
  voltage: number
): number {
  if (motorHp <= 0) return 0;
  
  // Simplified: 1 HP ≈ 2A contribution at 480V
  // Scale by voltage (lower voltage = higher current for same HP)
  const baseContribution = motorHp * 2; // At 480V
  const voltageFactor = 480 / voltage;
  
  return baseContribution * voltageFactor;
}

/**
 * Calculate total impedance including conductors
 * Returns fault current at point of calculation
 */
export function calculateFaultCurrentAtPoint(
  transformerFaultCurrent: number,
  secondaryVoltage: number,
  conductorImpedance: ConductorImpedance | null,
  conductorLength: number
): number {
  if (!conductorImpedance || conductorLength <= 0) {
    return transformerFaultCurrent;
  }

  // Calculate transformer internal impedance (approximate)
  // V = I × Z, so Z = V / I
  const transformerImpedance = secondaryVoltage / (transformerFaultCurrent * Math.sqrt(3));
  
  // Calculate conductor impedance at given length
  const lengthFactor = conductorLength / 1000; // Convert to thousands of feet
  const rConductor = conductorImpedance.r * lengthFactor;
  const xConductor = conductorImpedance.x * lengthFactor;
  const zConductor = Math.sqrt(rConductor ** 2 + xConductor ** 2);
  
  // Total impedance
  const zTotal = transformerImpedance + zConductor;
  
  // Calculate fault current at point (3-phase fault)
  const faultCurrentAtPoint = secondaryVoltage / (zTotal * Math.sqrt(3));
  
  return faultCurrentAtPoint;
}

/**
 * Determine required SCCR rating based on fault current
 * Uses standard UL ratings with safety margin
 */
export function determineSCCR(faultCurrent: number): string {
  // Add 25% safety margin
  const requiredSCCR = faultCurrent * 1.25;
  
  for (const rating of STANDARD_SCCR_RATINGS) {
    if (rating >= requiredSCCR) {
      return `${rating / 1000}kA`;
    }
  }
  
  return '200kA+';
}

/**
 * Calculate safety margin percentage
 */
export function calculateSafetyMargin(
  calculatedFaultCurrent: number,
  sccrRating: string
): number {
  const sccrValue = parseInt(sccrRating.replace(/[^0-9]/g, '')) * 1000;
  if (sccrValue <= 0) return 0;
  return ((sccrValue - calculatedFaultCurrent) / sccrValue) * 100;
}

/**
 * Main fault current calculation function
 */
export function calculateFaultCurrent(input: FaultCurrentInput): FaultCurrentResult {
  // Validate inputs
  if (input.kva <= 0) {
    throw new Error('Transformer kVA must be greater than 0');
  }
  if (input.secondaryVoltage <= 0) {
    throw new Error('Secondary voltage must be greater than 0');
  }
  if (input.impedancePercent <= 0) {
    throw new Error('Transformer impedance must be greater than 0%');
  }

  // Calculate transformer FLA
  const transformerFLA = calculateTransformerFLA(
    input.kva,
    input.secondaryVoltage,
    input.phase
  );

  // Calculate fault current at transformer
  const transformerFaultCurrent = calculateTransformerFaultCurrent(
    transformerFLA,
    input.impedancePercent
  );

  // Get conductor impedance if provided
  let conductorImpedance: ConductorImpedance | undefined;
  let totalConductorImpedance: number | undefined;
  
  if (input.conductorSize && input.conductorType && input.conductorLength && input.conductorLength > 0) {
    conductorImpedance = getConductorImpedance(input.conductorSize, input.conductorType) || undefined;
    if (conductorImpedance) {
      const lengthFactor = input.conductorLength / 1000;
      totalConductorImpedance = Math.sqrt(
        (conductorImpedance.r * lengthFactor) ** 2 +
        (conductorImpedance.x * lengthFactor) ** 2
      );
    }
  }

  // Calculate fault current at point
  const faultCurrentAtPoint = calculateFaultCurrentAtPoint(
    transformerFaultCurrent,
    input.secondaryVoltage,
    conductorImpedance || null,
    input.conductorLength || 0
  );

  // Calculate motor contribution
  let motorContribution = 0;
  if (input.includeMotorContribution && input.motorHp && input.motorHp > 0) {
    motorContribution = calculateMotorContribution(input.motorHp, input.secondaryVoltage);
  }

  // Total fault current
  const totalFaultCurrent = faultCurrentAtPoint + motorContribution;

  // Determine SCCR
  const sccrRequired = determineSCCR(totalFaultCurrent);
  const safetyMargin = calculateSafetyMargin(totalFaultCurrent, sccrRequired);

  return {
    transformerFLA: Math.round(transformerFLA * 10) / 10,
    transformerFaultCurrent: Math.round(transformerFaultCurrent),
    conductorImpedance,
    totalConductorImpedance: totalConductorImpedance ? Math.round(totalConductorImpedance * 1000) / 1000 : undefined,
    faultCurrentAtPoint: Math.round(faultCurrentAtPoint),
    motorContribution: Math.round(motorContribution),
    totalFaultCurrent: Math.round(totalFaultCurrent / 100) * 100, // Round to nearest 100A
    sccrRequired,
    safetyMargin: Math.round(safetyMargin * 10) / 10,
  };
}

/**
 * Get typical transformer impedance based on kVA rating
 */
export function getTypicalImpedance(kva: number): number {
  if (kva <= 150) return 2.0;
  if (kva <= 500) return 3.0;
  if (kva <= 1000) return 4.0;
  return 5.0;
}

/**
 * Format fault current for display
 */
export function formatFaultCurrent(amps: number): string {
  if (amps >= 1000) {
    return `${(amps / 1000).toFixed(1)}kA`;
  }
  return `${Math.round(amps)}A`;
}
