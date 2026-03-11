import {
  ServiceFeederInput,
  ServiceFeederResult,
  RecommendedServiceSize,
} from '../types/serviceFeeder';

const DEFAULTS = {
  smallApplianceCircuits: 2,
  includeLaundryCircuit: true,
  includeRange: true,
  rangeVa: 8000,
  includeDryer: true,
  dryerVa: 5000,
  voltage: 240,
} as const;

function round(value: number): number {
  return Math.round(value);
}

function clampToNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function recommendServiceSize(calculatedAmps: number): RecommendedServiceSize {
  if (calculatedAmps <= 100) return 100;
  if (calculatedAmps <= 200) return 200;
  return 400;
}

/**
 * NEC 220.82 demand factor used by this calculator:
 * - First 10,000 VA at 100%
 * - Remainder at 40%
 */
export function applyDwellingDemandFactor(totalVa: number): number {
  const safeTotal = clampToNonNegative(totalVa);
  if (safeTotal <= 10000) return safeTotal;
  return 10000 + (safeTotal - 10000) * 0.4;
}

export function calculateServiceFeeder(input: ServiceFeederInput): ServiceFeederResult {
  if (!Number.isFinite(input.squareFootage) || input.squareFootage <= 0) {
    throw new Error('Square footage must be greater than 0.');
  }

  const normalizedInput = {
    squareFootage: input.squareFootage,
    smallApplianceCircuits: input.smallApplianceCircuits ?? DEFAULTS.smallApplianceCircuits,
    includeLaundryCircuit: input.includeLaundryCircuit ?? DEFAULTS.includeLaundryCircuit,
    fastenedAppliancesVa: input.fastenedAppliancesVa ?? [],
    includeRange: input.includeRange ?? DEFAULTS.includeRange,
    rangeVa: input.rangeVa ?? DEFAULTS.rangeVa,
    includeDryer: input.includeDryer ?? DEFAULTS.includeDryer,
    dryerVa: input.dryerVa ?? DEFAULTS.dryerVa,
    heatingVa: input.heatingVa ?? 0,
    coolingVa: input.coolingVa ?? 0,
    voltage: input.voltage ?? DEFAULTS.voltage,
  };

  if (normalizedInput.voltage <= 0) {
    throw new Error('Voltage must be greater than 0.');
  }

  const generalLightingVa = round(clampToNonNegative(normalizedInput.squareFootage) * 3);
  const smallApplianceVa = round(clampToNonNegative(normalizedInput.smallApplianceCircuits) * 1500);
  const laundryVa = normalizedInput.includeLaundryCircuit ? 1500 : 0;

  const fastenedAppliancesVa = round(
    normalizedInput.fastenedAppliancesVa
      .map(clampToNonNegative)
      .reduce((sum, value) => sum + value, 0),
  );

  const rangeVa = normalizedInput.includeRange ? round(clampToNonNegative(normalizedInput.rangeVa)) : 0;
  const dryerVa = normalizedInput.includeDryer ? round(clampToNonNegative(normalizedInput.dryerVa)) : 0;

  // NEC 220.82: use larger of heating/cooling, not both
  const hvacLargestVa = round(
    Math.max(clampToNonNegative(normalizedInput.heatingVa), clampToNonNegative(normalizedInput.coolingVa)),
  );

  const connectedLoadVa =
    generalLightingVa +
    smallApplianceVa +
    laundryVa +
    fastenedAppliancesVa +
    rangeVa +
    dryerVa +
    hvacLargestVa;

  const demandAdjustedVa = round(applyDwellingDemandFactor(connectedLoadVa));
  const calculatedAmps = round(demandAdjustedVa / normalizedInput.voltage);
  const recommendedService = recommendServiceSize(calculatedAmps);
  const utilizationPercent = round((calculatedAmps / recommendedService) * 100);
  const exceeds80PercentRule = calculatedAmps > recommendedService * 0.8;

  const warnings: string[] = [];
  if (exceeds80PercentRule) {
    warnings.push(
      `Calculated load is ${utilizationPercent}% of ${recommendedService}A service. Consider next standard size for expansion margin.`,
    );
  }

  if (calculatedAmps > 400) {
    warnings.push('Calculated load exceeds 400A. Engineering review is recommended for larger service equipment.');
  }

  return {
    input: normalizedInput,
    breakdown: {
      generalLightingVa,
      smallApplianceVa,
      laundryVa,
      fastenedAppliancesVa,
      rangeVa,
      dryerVa,
      hvacLargestVa,
      connectedLoadVa,
      demandAdjustedVa,
    },
    calculatedAmps,
    recommendedService,
    utilizationPercent,
    exceeds80PercentRule,
    necArticle: '220.82-220.86',
    warnings,
  };
}
