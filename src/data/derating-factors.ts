/**
 * Derating factors for ampacity calculations
 * Based on NEC 2023 Article 310.15 methodology
 * 
 * - Temperature Correction: Adjusts for ambient temperature above 30°C
 * - Adjustment Factors: Adjusts for multiple current-carrying conductors in raceway
 */

export const temperatureCorrectionFactors: Record<number, Record<number, number>> = {
  60: {
    30: 0.71,
    35: 0.62,
    40: 0.50,
    45: 0.35,
    50: 0.00
  },
  75: {
    30: 0.88,
    35: 0.82,
    40: 0.75,
    45: 0.67,
    50: 0.58
  },
  90: {
    30: 1.00,
    35: 0.96,
    40: 0.91,
    45: 0.87,
    50: 0.82
  }
};

export const adjustmentFactors: Record<string, number> = {
  '1-3': 1.00,
  '4-6': 0.80,
  '7-9': 0.70,
  '10-20': 0.50,
  '21-30': 0.45,
  '31-40': 0.40,
  '41+': 0.35
};

export function getTemperatureCorrectionFactor(
  insulationTempRating: number,
  ambientTempC: number
): number {
  const factors = temperatureCorrectionFactors[insulationTempRating];
  if (!factors) return 1.0;
  
  // Find closest temp
  const temps = Object.keys(factors).map(Number).sort((a, b) => a - b);
  const closestTemp = temps.reduce((prev, curr) => 
    Math.abs(curr - ambientTempC) < Math.abs(prev - ambientTempC) ? curr : prev
  );
  
  return factors[closestTemp] || 1.0;
}
