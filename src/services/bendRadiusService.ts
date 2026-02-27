/**
 * Bend Radius Calculator Service
 * Based on NEC Article 300.34 - Minimum Bending Radii
 * Also includes specific requirements for MC (330.24) and AC (320.24) cables
 */

import {
  BendRadiusInput,
  BendRadiusResult,
  CableType,
  BEND_RADIUS_RULES,
} from '../types/bendRadius';

// Standard conductor diameters (approximate) for common sizes
// These are used when overall diameter is not provided
const CONDUCTOR_DIAMETERS: Record<string, number> = {
  '14': 0.104,
  '12': 0.122,
  '10': 0.146,
  '8': 0.216,
  '6': 0.274,
  '4': 0.324,
  '3': 0.364,
  '2': 0.414,
  '1': 0.494,
  '1/0': 0.549,
  '2/0': 0.608,
  '3/0': 0.674,
  '4/0': 0.750,
  '250': 0.866,
  '300': 0.948,
  '350': 1.023,
  '400': 1.092,
  '500': 1.216,
  '600': 1.339,
  '750': 1.502,
  '1000': 1.732,
};

// Get rule for cable type
function getRule(cableType: CableType) {
  const rule = BEND_RADIUS_RULES.find((r) => r.cableType === cableType);
  if (!rule) {
    throw new Error(`Unknown cable type: ${cableType}`);
  }
  return rule;
}

// Estimate cable diameter based on conductor size
function estimateCableDiameter(conductorSize: string, cableType: CableType): number {
  const baseDiameter = CONDUCTOR_DIAMETERS[conductorSize];
  
  if (!baseDiameter) {
    // For unknown sizes, estimate based on pattern
    const sizeNum = parseKcmil(conductorSize);
    if (sizeNum && sizeNum > 1000) {
      // Rough estimation for large cables
      return 1.732 + (sizeNum - 1000) / 1000 * 0.4;
    }
    throw new Error(`Unknown conductor size: ${conductorSize}`);
  }

  // Apply multiplier based on cable type to estimate overall diameter
  switch (cableType) {
    case 'ac':
    case 'mc':
    case 'interlocked':
      // These have armor, so add ~0.15" for armor thickness
      return baseDiameter + 0.15;
    case 'shielded':
      // Shielded cables have insulation and shield layers
      return baseDiameter * 2.5;
    case 'smooth':
    case 'corrugated':
      // Metallic sheathed cables
      return baseDiameter * 2.2;
    case 'nonshielded':
    default:
      // Standard multi-conductor cable (3 conductors + insulation)
      return baseDiameter * 2.8;
  }
}

// Parse kcmil value from string
function parseKcmil(size: string): number | null {
  // Handle fractional sizes like 1/0, 2/0, etc.
  if (size.includes('/')) {
    return null; // AWG fractional sizes don't convert directly
  }
  const num = parseInt(size, 10);
  return isNaN(num) ? null : num;
}

// Convert inches to millimeters
function inchesToMm(inches: number): number {
  return Math.round(inches * 25.4 * 10) / 10; // Round to 1 decimal
}

export function calculateBendRadius(input: BendRadiusInput): BendRadiusResult {
  const { cableType, conductorSize, overallDiameter } = input;

  // Get the rule for this cable type
  const rule = getRule(cableType);

  // Determine the reference diameter
  let referenceDiameter: number;
  let referenceDiameterType: string;

  if (overallDiameter) {
    // Use provided overall diameter
    referenceDiameter = overallDiameter;
    referenceDiameterType = 'User-provided overall diameter';
  } else {
    // Estimate based on conductor size
    referenceDiameter = estimateCableDiameter(conductorSize, cableType);
    referenceDiameterType = `Estimated from ${conductorSize} AWG/kcmil (${rule.diameterSource})`;
  }

  // Calculate minimum bend radius
  const minRadiusInches = Math.round(referenceDiameter * rule.multiplier * 100) / 100;
  const minRadiusMm = inchesToMm(minRadiusInches);

  // Generate warnings
  const warnings: string[] = [];

  if (!overallDiameter) {
    warnings.push('Using estimated cable diameter. For precise results, measure the actual cable diameter.');
  }

  if (parseKcmil(conductorSize) && parseKcmil(conductorSize)! > 500) {
    warnings.push('Large conductor. Verify bend radius with manufacturer specifications.');
  }

  if (cableType === 'shielded' && parseKcmil(conductorSize) && parseKcmil(conductorSize)! > 250) {
    warnings.push('Shielded cables > 250 kcmil may have additional manufacturer requirements.');
  }

  // Check if this is AC/MC cable with special requirements
  if (cableType === 'ac' || cableType === 'mc') {
    const minAcMcRadius = 5 * referenceDiameter;
    if (minRadiusInches < minAcMcRadius) {
      warnings.push(`Type ${cableType.toUpperCase()} cable must have bend radius ≥ 5x cable diameter per NEC ${rule.necReference}.`);
    }
  }

  return {
    input,
    minRadiusInches,
    minRadiusMm,
    multiplier: rule.multiplier,
    referenceDiameter,
    referenceDiameterType,
    necArticle: rule.necReference,
    warnings,
  };
}

// Get available conductor sizes
export function getAvailableConductorSizes(): string[] {
  return Object.keys(CONDUCTOR_DIAMETERS).sort((a, b) => {
    // Sort by actual size, not alphabetically
    const aNum = parseKcmil(a) || parseAwgToNumber(a);
    const bNum = parseKcmil(b) || parseAwgToNumber(b);
    if (aNum && bNum) {
      return aNum - bNum;
    }
    return a.localeCompare(b);
  });
}

// Helper to convert AWG to a sortable number
function parseAwgToNumber(awg: string): number | null {
  if (awg.includes('/')) {
    // 1/0 = -1, 2/0 = -2, etc.
    const match = awg.match(/(\d+)\/0/);
    if (match) {
      return -parseInt(match[1], 10);
    }
  }
  const num = parseInt(awg, 10);
  return isNaN(num) ? null : num;
}

// Get cable type display info
export function getCableTypeInfo(cableType: CableType) {
  const rule = getRule(cableType);
  return {
    label: rule.description,
    multiplier: rule.multiplier,
    appliesTo: rule.appliesTo,
    necReference: rule.necReference,
  };
}
