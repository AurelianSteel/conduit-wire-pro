/**
 * TypeScript types for Wire Ampacity Calculator
 * NEC 2023 Article 310.15 methodology
 */

// Define the possible wire sizes as a union type
export type WireSize = 
  | '14' | '12' | '10' | '8' | '6' | '4' | '3' | '2' | '1'
  | '1/0' | '2/0' | '3/0' | '4/0'
  | '250' | '300' | '350' | '400' | '500';

// Define the possible insulation types as a union type
export type InsulationType = 
  | 'THHN/THWN'
  | 'THHN/THWN-2'
  | 'XHHW-2'
  | 'RHW-2';

// Define the possible conductor count ranges as a union type
export type ConductorCountRange = 
  | '1-3' | '4-6' | '7-9' | '10-20' | '21-30' | '31-40' | '41+';

// Define the input interface for ampacity calculation
export interface AmpacityInput {
  wireSize: WireSize;
  insulationType: InsulationType;
  ambientTempC: number;
  conductorCountRange: ConductorCountRange;
  continuousLoad: boolean;
}

// Define the result interface for ampacity calculation
export interface AmpacityResult {
  input: AmpacityInput; // Input values for reference
  baseAmpacity: number; // Base ampacity value before adjustments
  temperatureCorrectionFactor: number; // Factor adjusting for ambient temperature
  adjustmentFactor: number; // Additional factor based on conductor count and other conditions
  continuousFactor: number; // Factor if the load is continuous
  deratedAmpacity: number; // Final calculated derated ampacity
  necArticle: string; // Relevant NEC article reference
  warnings: string[]; // Any warnings or notes regarding the calculation
}

// Define a map of insulation types to their maximum temperature ratings in Celsius
export const insulationTempRatings: Record<InsulationType, number> = {
  'THHN/THWN': 75,
  'THHN/THWN-2': 90,
  'XHHW-2': 90,
  'RHW-2': 90
};
