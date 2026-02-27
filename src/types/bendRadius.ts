/**
 * Bend Radius Types
 * Based on NEC Article 300.34 - Conductor Bend Radius
 */

export type CableType = 
  | 'nonshielded'      // Nonshielded conductors (multi-conductor cables)
  | 'shielded'         // Shielded conductors
  | 'interlocked'      // Interlocked armor
  | 'smooth'           // Smooth sheath
  | 'corrugated'       // Corrugated sheath
  | 'mc'               // Metal-clad cable (MC)
  | 'ac';              // Armored cable (AC/BX)

export interface BendRadiusInput {
  cableType: CableType;
  conductorSize: string;  // AWG or kcmil (e.g., '12', '6', '1/0', '250')
  overallDiameter?: number;  // Overall cable diameter in inches (for some cable types)
}

export interface BendRadiusResult {
  input: BendRadiusInput;
  minRadiusInches: number;
  minRadiusMm: number;
  multiplier: number;      // The multiplier used (e.g., 8x, 10x, 12x)
  referenceDiameter: number; // What diameter the multiplier is applied to
  referenceDiameterType: string; // Description of what diameter is used
  necArticle: string;
  warnings: string[];
}

// Multiplier data per NEC 300.34
export interface BendRadiusRule {
  cableType: CableType;
  description: string;
  multiplier: number;
  appliesTo: string;
  diameterSource: string;
  necReference: string;
}

export const BEND_RADIUS_RULES: BendRadiusRule[] = [
  {
    cableType: 'nonshielded',
    description: 'Nonshielded conductors without lead sheath',
    multiplier: 8,
    appliesTo: 'Multi-conductor cables without metallic sheath',
    diameterSource: 'Overall diameter of cable',
    necReference: '300.34(A)',
  },
  {
    cableType: 'shielded',
    description: 'Shielded conductors',
    multiplier: 12,
    appliesTo: 'Shielded power cables',
    diameterSource: 'Overall diameter of cable',
    necReference: '300.34(B)',
  },
  {
    cableType: 'interlocked',
    description: 'Interlocked armor',
    multiplier: 7,
    appliesTo: 'Type MC, Type AC with interlocked armor',
    diameterSource: 'Internal diameter of armor',
    necReference: '300.34(C)',
  },
  {
    cableType: 'smooth',
    description: 'Smooth metallic sheath',
    multiplier: 8,
    appliesTo: 'Lead-covered cables, smooth metal sheath',
    diameterSource: 'External diameter of metallic sheath',
    necReference: '300.34(D)',
  },
  {
    cableType: 'corrugated',
    description: 'Corrugated metallic sheath',
    multiplier: 5,
    appliesTo: 'Corrugated metal-clad cables',
    diameterSource: 'External diameter of metallic sheath',
    necReference: '300.34(E)',
  },
  {
    cableType: 'mc',
    description: 'Metal-clad cable (MC)',
    multiplier: 5,
    appliesTo: 'Type MC cable with corrugated sheath',
    diameterSource: 'External diameter of cable',
    necReference: '330.24',
  },
  {
    cableType: 'ac',
    description: 'Armored cable (AC/BX)',
    multiplier: 5,
    appliesTo: 'Type AC cable',
    diameterSource: 'External diameter of cable',
    necReference: '320.24',
  },
];
