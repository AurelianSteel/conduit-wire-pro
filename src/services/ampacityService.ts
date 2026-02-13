/**
 * Wire Ampacity Calculation Service
 * Implements NEC 2023 Article 310.15 derating methodology
 *
 * Calculation flow:
 * 1. Base ampacity (from wire size + insulation type)
 * 2. Temperature correction (ambient temp adjustment)
 * 3. Conductor count adjustment (raceway fill)
 * 4. Continuous load factor (125% rule)
 *
 * Final ampacity = base × tempFactor × adjustmentFactor × continuousFactor
 */

import { wireAmpacityData } from '../data/wire-ampacity-data';
import {
  adjustmentFactors,
  getTemperatureCorrectionFactor,
} from '../data/derating-factors';
import { AmpacityInput, AmpacityResult, insulationTempRatings } from '../types/ampacity';

export function calculateDeratedAmpacity(input: AmpacityInput): AmpacityResult {
  const { wireSize, insulationType, ambientTempC, conductorCountRange, continuousLoad } = input;

  // Step 1: Get Base Ampacity
  if (!(wireSize in wireAmpacityData) || !(insulationType in wireAmpacityData[wireSize])) {
    throw new Error(`Wire size ${wireSize} or insulation type ${insulationType} not found.`);
  }
  const baseAmpacity = wireAmpacityData[wireSize][insulationType];

  // Step 2: Calculate Temperature Correction Factor
  if (!(insulationType in insulationTempRatings)) {
    throw new Error(`Insulation type ${insulationType} not found for temperature rating.`);
  }
  const insulationTempRating = insulationTempRatings[insulationType];
  const temperatureCorrectionFactor = getTemperatureCorrectionFactor(insulationTempRating, ambientTempC);

  // Step 3: Get Adjustment Factor
  if (!(conductorCountRange in adjustmentFactors)) {
    throw new Error(`Conductor count range ${conductorCountRange} not found for adjustment factor.`);
  }
  const adjustmentFactor = adjustmentFactors[conductorCountRange];

  // Step 4: Apply Continuous Load Factor
  const continuousFactor = continuousLoad ? 0.8 : 1.0;

  // Step 5: Calculate Final Derated Ampacity
  const deratedAmpacity = baseAmpacity * temperatureCorrectionFactor * adjustmentFactor * continuousFactor;
  const finalAmpacity = Math.floor(deratedAmpacity); // Round down for safety

  // Step 6: Generate Warnings
  const warnings = generateWarnings(finalAmpacity, ambientTempC, conductorCountRange, temperatureCorrectionFactor, adjustmentFactor);

  // Step 7: Return Result
  return {
    input,
    baseAmpacity,
    temperatureCorrectionFactor,
    adjustmentFactor,
    continuousFactor,
    deratedAmpacity: finalAmpacity,
    necArticle: '310.15',
    warnings,
  };
}

function generateWarnings(
  deratedAmpacity: number,
  ambientTempC: number,
  conductorCountRange: string,
  tempCorrectionFactor: number,
  adjFactor: number
): string[] {
  const warnings: string[] = [];

  // Warning Conditions
  if (deratedAmpacity < 15) {
    warnings.push('⚠️ Very low ampacity. Consider larger wire size.');
  }

  if (ambientTempC > 40) {
    warnings.push('⚠️ High ambient temperature. Verify installation conditions.');
  }

  if (conductorCountRange.includes('20') || conductorCountRange.includes('30') || conductorCountRange.includes('40')) {
    warnings.push('⚠️ Heavy conduit loading. Consider splitting circuits.');
  }

  if (tempCorrectionFactor < 0.9 && adjFactor < 0.8) {
    warnings.push('⚠️ Multiple derating factors applied. Double-check calculations.');
  }

  return warnings;
}
