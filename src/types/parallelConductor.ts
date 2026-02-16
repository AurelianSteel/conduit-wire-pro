/**
 * TypeScript types for Parallel Conductor Calculator
 * NEC 2023 Article 310.10 methodology
 */

import { WireSize } from './ampacity';

export type ConductorMaterial = 'copper' | 'aluminum';
export type TerminalRating = 60 | 75 | 90; // °C

export interface ParallelConductorInput {
  totalAmpacity: number; // Total required ampacity
  numberOfRuns: number; // Number of parallel runs (2-6 typically)
  conductorMaterial: ConductorMaterial;
  terminalRating: TerminalRating; // °C
  installationMethod: string; // e.g., 'conduit', 'cable tray', 'direct burial'
}

export interface ParallelConductorResult {
  input: ParallelConductorInput;
  
  // Calculated values
  ampacityPerConductor: number; // Ampacity required for each conductor
  recommendedConductorSize: string; // AWG or kcmil
  conductorAWG?: WireSize; // If wire size is standard AWG
  conductorKcmil?: number; // If wire size is in kcmil
  
  // NEC requirements
  minConductorSize: string; // Minimum size allowed for parallel conductors
  requiresParallel: boolean; // Whether parallel conductors are actually required
  
  // Installation details
  totalConductors: number; // Total number of conductors (including parallel runs)
  installationConsiderations: string[];
  
  // Display properties (from service)
  conductorMaterial: ConductorMaterial;
  terminalRating: TerminalRating;
  
  necArticle: string;
  warnings: string[];
}