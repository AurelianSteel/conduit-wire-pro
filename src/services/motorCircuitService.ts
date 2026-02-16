import { getMotorFLA, MotorHP, MotorVoltage } from '../data/motor-fla-data';
import { MotorCircuitInput, MotorCircuitResult } from '../types/motor';
import { findConductorSize } from '../data/motor-conductor-data';

export function calculateMotorCircuit(input: MotorCircuitInput): MotorCircuitResult {
  const { hp, voltage, conductorMaterial, terminalRating, continuousLoad } = input;
  
  // Step 1: Get FLA
  const fla = getMotorFLA(hp, voltage);
  if (!fla) {
    throw new Error(`FLA not available for ${hp} HP at ${voltage}`);
  }
  
  // Step 2: Conductor sizing (NEC 430.22)
  // Minimum ampacity = 125% of FLA
  // For continuous loads (3+ hours), NEC 210.19(A)(1) requires additional 125% multiplier
  const baseMinAmpacity = Math.ceil(fla * 1.25);
  const minConductorAmpacity = continuousLoad ? Math.ceil(baseMinAmpacity * 1.25) : baseMinAmpacity;
  
  // Find conductor size based on material and terminal rating
  const material = conductorMaterial === 'copper' ? 'copper' : 'aluminum';
  const conductorSize = findConductorSize(minConductorAmpacity, material, terminalRating);
  
  if (!conductorSize) {
    throw new Error(`No conductor size available for ${minConductorAmpacity}A`);
  }
  
  const recommendedConductorSize = conductorSize;
  
  // Step 3: OCPD sizing (NEC 430.52)
  // Inverse time breaker: 250% of FLA (max)
  // Dual element fuse: 175% of FLA (max)
  const maxBreakerRating = Math.ceil(fla * 2.5);
  const maxFuseRating = Math.ceil(fla * 1.75);
  
  // Standard breaker sizes
  const standardSizes = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350, 400];
  const recommendedBreaker = standardSizes.find((size) => size >= maxBreakerRating) || maxBreakerRating;
  const recommendedOCPD = `${recommendedBreaker}A breaker (or ${maxFuseRating}A fuse)`;
  
  // Step 4: Disconnect sizing (NEC 430.110)
  // Minimum = 115% of FLA
  const minDisconnectRating = Math.ceil(fla * 1.15);
  
  // Step 5: Overload protection (NEC 430.32)
  // Service factor ≥ 1.15: 125% of FLA
  // Service factor < 1.15: 115% of FLA
  // Assume SF ≥ 1.15 for simplicity
  const overloadMin = parseFloat((fla * 1.15).toFixed(1));
  const overloadMax = parseFloat((fla * 1.25).toFixed(1));
  
  // Step 6: Generate warnings
  const warnings = generateWarnings(fla, minConductorAmpacity, recommendedBreaker);
  
  return {
    input,
    fla,
    minConductorAmpacity,
    recommendedConductorSize,
    maxBreakerRating,
    maxFuseRating,
    recommendedOCPD,
    minDisconnectRating,
    overloadMin,
    overloadMax,
    necArticle: '430',
    warnings,
  };
}

function generateWarnings(fla: number, ampacity: number, breakerRating: number): string[] {
  const warnings: string[] = [];
  
  if (fla > 200) {
    warnings.push('⚠️ Large motor. Consider soft-start or VFD.');
  }
  
  if (ampacity > 400) {
    warnings.push('⚠️ Very large conductor. Verify conduit fill and termination ratings.');
  }
  
  if (breakerRating > 200) {
    warnings.push('⚠️ High OCPD rating. Confirm with utility and panel rating.');
  }
  
  return warnings;
}