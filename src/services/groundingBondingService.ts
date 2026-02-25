import {
  ConductorSize,
  EGCSizingInput,
  EGCSizingResult,
  GECSizingInput,
  GECSizingResult,
  ElectrodeType,
} from '../types/groundingBonding';

const EGC_TABLE = [
  { maxOcpd: 15, copper: '14 AWG', aluminum: '12 AWG' },
  { maxOcpd: 20, copper: '12 AWG', aluminum: '10 AWG' },
  { maxOcpd: 60, copper: '10 AWG', aluminum: '8 AWG' },
  { maxOcpd: 100, copper: '8 AWG', aluminum: '6 AWG' },
  { maxOcpd: 200, copper: '6 AWG', aluminum: '4 AWG' },
  { maxOcpd: 300, copper: '4 AWG', aluminum: '2 AWG' },
  { maxOcpd: 400, copper: '3 AWG', aluminum: '1 AWG' },
  { maxOcpd: 500, copper: '2 AWG', aluminum: '1/0 AWG' },
  { maxOcpd: 600, copper: '1 AWG', aluminum: '2/0 AWG' },
  { maxOcpd: 800, copper: '1/0 AWG', aluminum: '3/0 AWG' },
  { maxOcpd: 1000, copper: '2/0 AWG', aluminum: '4/0 AWG' },
  { maxOcpd: 1200, copper: '3/0 AWG', aluminum: '250 kcmil' },
  { maxOcpd: 1600, copper: '4/0 AWG', aluminum: '350 kcmil' },
  { maxOcpd: 2000, copper: '250 kcmil', aluminum: '400 kcmil' },
  { maxOcpd: 2500, copper: '350 kcmil', aluminum: '600 kcmil' },
  { maxOcpd: 3000, copper: '500 kcmil', aluminum: '750 kcmil' },
  { maxOcpd: 4000, copper: '700 kcmil', aluminum: '1000 kcmil' },
  { maxOcpd: 5000, copper: '1000 kcmil', aluminum: '1250 kcmil' },
  { maxOcpd: 6000, copper: '1200 kcmil', aluminum: '1500 kcmil' },
] as const;

// Complete Table 250.66 for GEC sizing
// Based on NEC Table 250.66 - Grounding Electrode Conductor for AC Systems
// Complete Table 250.66 for GEC sizing
// Based on NEC Table 250.66 - Grounding Electrode Conductor for AC Systems
// Format: if largest ungrounded conductor is <= maxUngrounded, use the specified GEC size
const GEC_TABLE_250_66: { maxUngrounded: ConductorSize; copper: string; aluminum: string }[] = [
  { maxUngrounded: '2', copper: '8 AWG', aluminum: '6 AWG' },      // Up to #2 AWG
  { maxUngrounded: '1/0', copper: '6 AWG', aluminum: '4 AWG' },    // #1 to 1/0 AWG
  { maxUngrounded: '3/0', copper: '4 AWG', aluminum: '2 AWG' },    // 2/0 to 3/0 AWG
  { maxUngrounded: '350', copper: '2 AWG', aluminum: '1/0 AWG' },  // 4/0 to 350 kcmil
  { maxUngrounded: '600', copper: '1/0 AWG', aluminum: '3/0 AWG' }, // 400 to 600 kcmil
  { maxUngrounded: '900', copper: '2/0 AWG', aluminum: '4/0 AWG' }, // 700 to 900 kcmil
  { maxUngrounded: '1250', copper: '3/0 AWG', aluminum: '250 kcmil' }, // 1000 to 1250 kcmil
  { maxUngrounded: '2000', copper: '4/0 AWG', aluminum: '350 kcmil' }, // 1500 to 2000 kcmil
];

// NEC 250.66(A) - Max size for rod/pipe/plate electrodes
const GEC_MAX_ROD_PIPE_PLATE = {
  copper: '6 AWG',
  aluminum: '4 AWG',
} as const;

// NEC 250.66(B) - Max size for concrete-encased electrodes (Ufer)
const GEC_MAX_CONCRETE_ENCASED = {
  copper: '4 AWG',
  aluminum: null, // Not typically used with aluminum
} as const;

// Absolute minimums per NEC 250.66
const GEC_ABSOLUTE_MINIMUM = {
  copper: '8 AWG',
  aluminum: '6 AWG',
} as const;

// Absolute maximums (need not be larger than)
const GEC_ABSOLUTE_MAXIMUM = {
  copper: '3/0 AWG',
  aluminum: '250 kcmil',
} as const;

const GEC_ORDER: ConductorSize[] = [
  '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0',
  '250', '300', '350', '400', '500', '600', '700', '750', '800', '900',
  '1000', '1250', '1500', '1750', '2000',
];

function getConductorIndex(size: ConductorSize): number {
  const idx = GEC_ORDER.indexOf(size);
  if (idx === -1) {
    throw new Error(`Unsupported conductor size: ${size}`);
  }
  return idx;
}

function formatInputSize(size: ConductorSize): string {
  return Number(size).toString() === size ? `${size} kcmil` : `${size} AWG`;
}

/**
 * Parse a conductor size string into a comparable value
 * Returns a numeric value where higher = larger conductor
 */
function parseConductorSize(s: string): { value: number; isKcmil: boolean } {
  const clean = s.replace(' AWG', '').replace(' kcmil', '').trim();
  const isKcmil = s.includes('kcmil');
  
  if (isKcmil) {
    return { value: parseInt(clean, 10), isKcmil: true };
  }
  
  // Handle fractional sizes like 1/0, 2/0, 3/0, 4/0
  if (clean.includes('/')) {
    const [num] = clean.split('/');
    const n = parseInt(num, 10);
    // Map: 1/0=1, 2/0=2, 3/0=3, 4/0=4 for comparison
    // These are larger than regular AWG (which we'll map to negative)
    return { value: n, isKcmil: false };
  }
  
  // Regular AWG: map to negative values (smaller AWG = larger wire)
  // 8 AWG -> -8, 6 AWG -> -6, etc.
  // This means -6 > -8 (6 AWG is larger than 8 AWG)
  return { value: -parseInt(clean, 10), isKcmil: false };
}

/**
 * Compare two conductor sizes
 * Returns positive if size1 > size2, negative if size1 < size2, 0 if equal
 */
function compareConductorSizes(size1: string, size2: string): number {
  const s1 = parseConductorSize(size1);
  const s2 = parseConductorSize(size2);

  // kcmil is always larger than AWG
  if (s1.isKcmil && !s2.isKcmil) return 1;
  if (!s1.isKcmil && s2.isKcmil) return -1;

  // Within same unit type, compare numeric values
  return s1.value - s2.value;
}

function getLargerSize(size1: string, size2: string): string {
  return compareConductorSizes(size1, size2) > 0 ? size1 : size2;
}

function getSmallerSize(size1: string, size2: string): string {
  return compareConductorSizes(size1, size2) < 0 ? size1 : size2;
}

/**
 * Check if conductor size1 is less than or equal to size2
 * Based on wire size hierarchy (8 < 6 < 4 < ... < 1/0 < 2/0 < ... < 250 < 300...)
 */
function isConductorSizeLTE(size1: ConductorSize, size2: ConductorSize): boolean {
  const idx1 = GEC_ORDER.indexOf(size1);
  const idx2 = GEC_ORDER.indexOf(size2);
  if (idx1 === -1 || idx2 === -1) {
    throw new Error(`Invalid conductor size: ${size1} or ${size2}`);
  }
  return idx1 <= idx2;
}

/**
 * Get base GEC size from Table 250.66 based on largest ungrounded conductor
 */
function getBaseGECSize(size: ConductorSize, material: 'copper' | 'aluminum'): string {
  for (const row of GEC_TABLE_250_66) {
    if (isConductorSizeLTE(size, row.maxUngrounded)) {
      return material === 'copper' ? row.copper : row.aluminum;
    }
  }
  // For sizes larger than 2000 kcmil, use the 12.5% rule (not implemented here)
  // Return the maximum for now
  return material === 'copper' ? GEC_ABSOLUTE_MAXIMUM.copper : GEC_ABSOLUTE_MAXIMUM.aluminum;
}

/**
 * Apply minimum and maximum constraints to GEC size
 */
function applyGECConstraints(
  baseSize: string,
  material: 'copper' | 'aluminum',
  electrodeType?: ElectrodeType
): { size: string; note?: string } {
  const absMin = material === 'copper' ? GEC_ABSOLUTE_MINIMUM.copper : GEC_ABSOLUTE_MINIMUM.aluminum;
  const absMax = material === 'copper' ? GEC_ABSOLUTE_MAXIMUM.copper : GEC_ABSOLUTE_MAXIMUM.aluminum;

  // Start with base size from table
  let size = baseSize;
  let notes: string[] = [];

  // Apply absolute minimum
  if (compareConductorSizes(size, absMin) < 0) {
    size = absMin;
    notes.push(`Minimum ${material} GEC is ${absMin} per NEC 250.66`);
  }

  // Apply electrode-specific maximums
  if (electrodeType === 'rod-pipe-plate') {
    const maxSize = material === 'copper' ? GEC_MAX_ROD_PIPE_PLATE.copper : GEC_MAX_ROD_PIPE_PLATE.aluminum;
    if (compareConductorSizes(size, maxSize) > 0) {
      size = maxSize;
      notes.push(`NEC 250.66(A): Not required to be larger than ${maxSize} for rod/pipe/plate electrodes`);
    }
  } else if (electrodeType === 'concrete-encased' && material === 'copper') {
    const maxSize = GEC_MAX_CONCRETE_ENCASED.copper!;
    if (compareConductorSizes(size, maxSize) > 0) {
      size = maxSize;
      notes.push(`NEC 250.66(B): Not required to be larger than ${maxSize} for concrete-encased electrodes`);
    }
  } else {
    // Apply absolute maximum for other electrode types
    if (compareConductorSizes(size, absMax) > 0) {
      size = absMax;
      notes.push(`NEC 250.66: Need not be larger than ${absMax}`);
    }
  }

  return { size, note: notes.length > 0 ? notes.join('. ') : undefined };
}

export function calculateEGCSize(input: EGCSizingInput): EGCSizingResult {
  const { ocpdRating, material } = input;

  if (!Number.isFinite(ocpdRating) || ocpdRating < 15 || ocpdRating > 6000) {
    throw new Error('OCPD rating must be between 15A and 6000A');
  }

  const row = EGC_TABLE.find((entry) => ocpdRating <= entry.maxOcpd);
  if (!row) {
    throw new Error(`No EGC table entry for ${ocpdRating}A`);
  }

  const minimumSize = material === 'copper' ? row.copper : row.aluminum;

  return {
    input,
    minimumSize,
    necReference: '250.122',
    details: `For ${ocpdRating}A OCPD with ${material} conductor, minimum EGC is ${minimumSize}.`,
  };
}

export function calculateGECSize(
  input: GECSizingInput & { electrodeType?: ElectrodeType }
): GECSizingResult {
  const { largestUngroundedConductor, material, electrodeType } = input;

  // Get base size from Table 250.66
  const baseSize = getBaseGECSize(largestUngroundedConductor, material);

  // Apply constraints
  const { size: minimumSize, note } = applyGECConstraints(baseSize, material, electrodeType);

  let details = `For largest ungrounded conductor ${formatInputSize(
    largestUngroundedConductor
  )}, minimum GEC is ${minimumSize} (${material}).`;

  if (note) {
    details += ` ${note}`;
  }

  return {
    input: { largestUngroundedConductor, material },
    minimumSize,
    necReference: '250.66',
    details,
  };
}

export function calculateMBJSize(
  input: GECSizingInput & { electrodeType?: ElectrodeType }
): GECSizingResult {
  const gec = calculateGECSize(input);
  return {
    ...gec,
    necReference: '250.28',
    details: `For largest ungrounded conductor ${formatInputSize(
      input.largestUngroundedConductor
    )}, minimum MBJ is ${gec.minimumSize} (${input.material}).`,
  };
}

export const groundingBondingData = {
  egcOcpdRatings: [
    15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250,
    300, 350, 400, 450, 500, 600, 700, 800, 1000, 1200, 1600, 2000, 2500, 3000,
    4000, 5000, 6000,
  ],
  conductorSizes: GEC_ORDER,
  electrodeTypes: [
    { value: 'standard' as ElectrodeType, label: 'Standard (Table 250.66)' },
    { value: 'rod-pipe-plate' as ElectrodeType, label: 'Rod/Pipe/Plate (250.66(A))' },
    { value: 'concrete-encased' as ElectrodeType, label: 'Concrete-Encased/Ufer (250.66(B))' },
  ],
};
