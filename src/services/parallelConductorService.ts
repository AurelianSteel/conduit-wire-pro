/**
 * Parallel Conductor Sizing Service
 * Based on NEC Article 310.10 - Parallel Conductors
 * 
 * Parallel conductors are used when:
 * - Ampacity requirements exceed single conductor limits
 * - Large feeders/services where multiple smaller conductors are preferred
 */

import { findConductorSize, ConductorSize } from '../data/motor-conductor-data';

export interface ParallelConductorInput {
  totalAmpacity: number;        // Required total ampacity
  numRuns: number;              // Number of parallel runs (2-6 typical)
  conductorMaterial: 'copper' | 'aluminum';
  terminalRating: 60 | 75 | 90; // Temperature rating in °C
  includeNeutral: boolean;      // Whether to include neutral sizing
  neutralRatio?: number;        // Neutral sizing ratio (default 0.5 for 50%)
}

export interface ParallelConductorResult {
  input: ParallelConductorInput;
  ampacityPerConductor: number;  // Ampacity each conductor must handle
  minConductorSize: ConductorSize;  // Minimum AWG/kcmil per conductor
  recommendedSize: ConductorSize;   // Recommended with 20% headroom
  totalAmpacityAchieved: number;    // Actual ampacity with selected size
  headroomPercent: number;          // Headroom percentage
  neutralSize?: ConductorSize;      // Neutral conductor size if applicable
  parallelSets: number;             // Number of parallel sets
  conductorsPerPhase: number;       // Conductors per phase (1 per run per phase)
  conductorMaterial: 'copper' | 'aluminum';  // Material for display
  terminalRating: 60 | 75 | 90;   // Terminal rating for display
  necArticle: string;               // NEC reference
  warnings: string[];
  wireSpecs: {
    phase: string;                 // Phase wire spec
    neutral?: string;              // Neutral wire spec
    ground: string;                // Ground wire spec (estimated)
  };
}

// Minimum conductor sizes allowed in parallel per NEC 310.10(G)
const MIN_PARALLEL_SIZE: ConductorSize = '1/0'; // 1/0 AWG minimum for parallel

// Standard ground wire sizes (approximate based on NEC Table 250.122)
function getGroundWireSize(phaseSize: ConductorSize): string {
  const groundSizes: Record<string, string> = {
    '14': '14 AWG',
    '12': '12 AWG',
    '10': '10 AWG',
    '8': '10 AWG',
    '6': '10 AWG',
    '4': '8 AWG',
    '3': '8 AWG',
    '2': '8 AWG',
    '1': '6 AWG',
    '1/0': '6 AWG',
    '2/0': '6 AWG',
    '3/0': '6 AWG',
    '4/0': '4 AWG',
    '250': '4 AWG',
    '300': '4 AWG',
    '350': '3 AWG',
    '400': '3 AWG',
    '500': '2 AWG',
  };
  return groundSizes[phaseSize] || '1/0 AWG';
}

// Find next larger conductor size for headroom
function getNextLargerSize(size: ConductorSize): ConductorSize | null {
  const order: ConductorSize[] = [
    '14', '12', '10', '8', '6', '4', '3', '2', '1',
    '1/0', '2/0', '3/0', '4/0', '250', '300', '350', '400', '500'
  ];
  const idx = order.indexOf(size);
  return idx < order.length - 1 ? order[idx + 1] : null;
}

export function calculateParallelConductors(input: ParallelConductorInput): ParallelConductorResult {
  const { totalAmpacity, numRuns, conductorMaterial, terminalRating, includeNeutral, neutralRatio = 0.5 } = input;
  
  // Validate minimum parallel requirements per NEC 310.10(G)
  if (numRuns < 2) {
    throw new Error('Parallel conductors require at least 2 runs per NEC 310.10(G)');
  }
  
  // Calculate ampacity per conductor
  const ampacityPerConductor = Math.ceil(totalAmpacity / numRuns);
  
  // Find minimum conductor size
  const minConductorSize = findConductorSize(ampacityPerConductor, conductorMaterial, terminalRating);
  
  if (!minConductorSize) {
    throw new Error(`No single conductor can handle ${ampacityPerConductor}A. Consider more parallel runs.`);
  }
  
  // Check if size meets minimum for parallel (1/0 AWG)
  const order: ConductorSize[] = ['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0', '250', '300', '350', '400', '500'];
  const minSizeIndex = order.indexOf(MIN_PARALLEL_SIZE);
  const sizeIndex = order.indexOf(minConductorSize);
  
  if (sizeIndex < minSizeIndex) {
    throw new Error(
      `Conductor size ${minConductorSize} is below minimum 1/0 AWG for parallel installations per NEC 310.10(G). ` +
      `Consider reducing number of runs or using a single larger conductor.`
    );
  }
  
  // Get recommended size with 20% headroom
  let recommendedSize = minConductorSize;
  const headroomAmpacity = Math.ceil(ampacityPerConductor * 1.2);
  const headroomSize = findConductorSize(headroomAmpacity, conductorMaterial, terminalRating);
  if (headroomSize) {
    recommendedSize = headroomSize;
  }
  
  // Calculate actual ampacity achieved
  const { motorConductorAmpacity } = require('../data/motor-conductor-data');
  const actualAmpacityPerConductor = motorConductorAmpacity[recommendedSize][conductorMaterial][terminalRating];
  const totalAmpacityAchieved = actualAmpacityPerConductor * numRuns;
  const headroomPercent = Math.round(((totalAmpacityAchieved - totalAmpacity) / totalAmpacity) * 100);
  
  // Calculate neutral size if needed
  let neutralSize: ConductorSize | undefined;
  if (includeNeutral) {
    const neutralAmpacity = Math.ceil(totalAmpacity * neutralRatio / numRuns);
    neutralSize = findConductorSize(neutralAmpacity, conductorMaterial, terminalRating) || minConductorSize;
  }
  
  // Generate warnings
  const warnings: string[] = [];
  
  if (numRuns > 6) {
    warnings.push('⚠️ More than 6 parallel runs. Verify conduit fill and installation complexity.');
  }
  
  if (totalAmpacity > 1000) {
    warnings.push('⚠️ Large installation. Consider engineered design for termination coordination.');
  }
  
  if (numRuns === 2 && order.indexOf(recommendedSize) >= order.indexOf('4/0')) {
    warnings.push('💡 With 2 runs of this size, consider using busway or cable bus.');
  }
  
  // Build wire specifications
  const wireSpecs = {
    phase: `${numRuns} sets of ${recommendedSize} AWG ${conductorMaterial === 'copper' ? 'Cu' : 'Al'} @ ${terminalRating}°C`,
    neutral: includeNeutral ? `${numRuns} sets of ${neutralSize} AWG ${conductorMaterial === 'copper' ? 'Cu' : 'Al'} (neutral)` : undefined,
    ground: `${numRuns} sets of ${getGroundWireSize(recommendedSize)} (EGC)`,
  };
  
  return {
    input,
    ampacityPerConductor,
    minConductorSize,
    recommendedSize,
    totalAmpacityAchieved,
    headroomPercent,
    neutralSize,
    parallelSets: numRuns,
    conductorsPerPhase: numRuns,
    conductorMaterial,
    terminalRating,
    necArticle: '310.10(G)',
    warnings,
    wireSpecs,
  };
}

// Helper to recommend optimal number of runs
export function recommendParallelRuns(
  totalAmpacity: number,
  conductorMaterial: 'copper' | 'aluminum',
  terminalRating: 60 | 75 | 90,
  maxRuns: number = 6
): { numRuns: number; size: ConductorSize; efficiency: number }[] {
  const recommendations: { numRuns: number; size: ConductorSize; efficiency: number }[] = [];
  
  for (let runs = 2; runs <= maxRuns; runs++) {
    try {
      const perConductor = Math.ceil(totalAmpacity / runs);
      const size = findConductorSize(perConductor, conductorMaterial, terminalRating);
      
      if (size) {
        // Efficiency: how close to ideal ampacity utilization (higher is better)
        const { motorConductorAmpacity } = require('../data/motor-conductor-data');
        const actualAmpacity = motorConductorAmpacity[size][conductorMaterial][terminalRating] * runs;
        const efficiency = Math.round((totalAmpacity / actualAmpacity) * 100);
        
        recommendations.push({ numRuns: runs, size, efficiency });
      }
    } catch {
      // Skip invalid configurations
    }
  }
  
  return recommendations.sort((a, b) => b.efficiency - a.efficiency);
}
