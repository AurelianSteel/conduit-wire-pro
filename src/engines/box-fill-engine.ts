/**
 * Box Fill Calculator Engine
 * Calculates box fill per NEC Article 314.16
 */

import {
  BoxSize,
  ConductorEntry,
  getConductorVolume,
  ALL_BOXES,
} from '../data/box-dimensions';

export interface BoxFillInputs {
  selectedBox: BoxSize;
  conductors: ConductorEntry[];
  hasInternalClamps: boolean;
  deviceYokeCount: number;
  hasGroundingConductors: boolean;
  largestGroundAWG?: number;
}

export interface BoxFillBreakdown {
  conductors: {
    totalVolume: number;
    details: Array<{ awg: number; count: number; volumeEach: number; subtotal: number }>;
  };
  clamps: {
    count: number;
    volume: number;
    note: string;
  };
  deviceYokes: {
    count: number;
    volume: number;
    note: string;
  };
  grounds: {
    count: number;
    volume: number;
    note: string;
  };
  totalVolume: number;
}

export interface BoxFillResult {
  box: BoxSize;
  breakdown: BoxFillBreakdown;
  isAdequate: boolean;
  remainingVolume: number;
  utilizationPercent: number;
  totalVolume: number;
}

export interface BoxFillCalculation {
  selectedResult: BoxFillResult;
  minimumBox: BoxSize | null;
  allResults: BoxFillResult[];
}

/**
 * Calculate box fill for the given inputs
 * Returns the selected box result, minimum adequate box, and results for all boxes
 */
export function calculateBoxFill(inputs: BoxFillInputs): BoxFillCalculation {
  const { selectedBox, conductors, hasInternalClamps, deviceYokeCount, hasGroundingConductors, largestGroundAWG } = inputs;

  // Calculate results for all boxes
  const allResults: BoxFillResult[] = ALL_BOXES.map(box => {
    const breakdown = calculateBreakdown(box, conductors, hasInternalClamps, deviceYokeCount, hasGroundingConductors, largestGroundAWG);
    const isAdequate = breakdown.totalVolume <= box.volumeIn3;
    const remainingVolume = box.volumeIn3 - breakdown.totalVolume;
    const utilizationPercent = (breakdown.totalVolume / box.volumeIn3) * 100;

    return {
      box,
      breakdown,
      isAdequate,
      remainingVolume,
      utilizationPercent,
      totalVolume: breakdown.totalVolume,
    };
  });

  // Find the selected box result
  const selectedResult = allResults.find(r => r.box.id === selectedBox.id) || allResults[0];

  // Find the minimum adequate box (smallest volume that meets requirements)
  const adequateBoxes = allResults.filter(r => r.isAdequate);
  const minimumBox = adequateBoxes.length > 0
    ? adequateBoxes.reduce((min, current) => 
        current.box.volumeIn3 < min.box.volumeIn3 ? current : min
      ).box
    : null;

  return {
    selectedResult,
    minimumBox,
    allResults,
  };
}

/**
 * Calculate the breakdown for a specific box
 */
function calculateBreakdown(
  box: BoxSize,
  conductors: ConductorEntry[],
  hasInternalClamps: boolean,
  deviceYokeCount: number,
  hasGroundingConductors: boolean,
  largestGroundAWG?: number
): BoxFillBreakdown {
  // Find the largest conductor AWG and its volume
  let largestAWG = 14;
  let largestVolume = 2.00;

  const conductorDetails: Array<{ awg: number; count: number; volumeEach: number; subtotal: number }> = [];
  let totalConductorVolume = 0;

  for (const entry of conductors) {
    const volume = getConductorVolume(entry.awg);
    if (volume && entry.quantity > 0) {
      const subtotal = volume * entry.quantity;
      conductorDetails.push({
        awg: entry.awg,
        count: entry.quantity,
        volumeEach: volume,
        subtotal,
      });
      totalConductorVolume += subtotal;

      // Track largest conductor
      if (entry.awg < largestAWG || (entry.awg === largestAWG && volume > largestVolume)) {
        largestAWG = entry.awg;
        largestVolume = volume;
      }
    }
  }

  // Internal clamps: 1 × volume of largest conductor (NEC 314.16(B)(2))
  const clampVolume = hasInternalClamps ? largestVolume : 0;

  // Device yokes: 2 × volume of largest conductor per yoke (NEC 314.16(B)(4))
  const deviceYokeVolume = deviceYokeCount > 0 ? deviceYokeCount * 2 * largestVolume : 0;

  // Grounding conductors: 1 × volume of largest ground conductor (NEC 314.16(B)(5))
  let groundVolume = 0;
  if (hasGroundingConductors) {
    const groundAWG = largestGroundAWG || largestAWG;
    const groundVol = getConductorVolume(groundAWG) || largestVolume;
    groundVolume = groundVol;
  }

  const totalVolume = totalConductorVolume + clampVolume + deviceYokeVolume + groundVolume;

  return {
    conductors: {
      totalVolume: totalConductorVolume,
      details: conductorDetails,
    },
    clamps: {
      count: hasInternalClamps ? 1 : 0,
      volume: clampVolume,
      note: hasInternalClamps ? `1 × ${largestVolume} cu in (largest conductor)` : 'None',
    },
    deviceYokes: {
      count: deviceYokeCount,
      volume: deviceYokeVolume,
      note: deviceYokeCount > 0 ? `${deviceYokeCount} × 2 × ${largestVolume} cu in` : 'None',
    },
    grounds: {
      count: hasGroundingConductors ? 1 : 0,
      volume: groundVolume,
      note: hasGroundingConductors 
        ? `1 × ${groundVolume} cu in (largest ground)` 
        : 'None',
    },
    totalVolume,
  };
}

/**
 * Get a quick summary string for a box fill result
 */
export function getResultSummary(result: BoxFillResult): string {
  if (result.isAdequate) {
    return `✓ Adequate - ${result.utilizationPercent.toFixed(1)}% full`;
  } else {
    return `✗ Overfilled - ${result.utilizationPercent.toFixed(1)}% (${(result.totalVolume - result.box.volumeIn3).toFixed(1)} cu in over)`;
  }
}
