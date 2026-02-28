/**
 * Pipe Bending Calculator Service
 * Calculates bend marks, offsets, saddles, and rolling offsets
 * Based on standard electrician's conduit bending formulas
 */

import {
  ConduitSize,
  BendAngle,
  OffsetInput,
  OffsetResult,
  SaddleInput,
  SaddleResult,
  NinetyInput,
  NinetyResult,
  RollingOffsetInput,
  RollingOffsetResult,
  OFFSET_MULTIPLIERS,
  SHRINKAGE_FACTORS,
  TAKE_UP_VALUES,
  GAIN_VALUES,
} from '../types/pipeBending';

/**
 * Round to nearest 1/16 inch for practical marking
 */
function roundToSixteenth(value: number): number {
  return Math.round(value * 16) / 16;
}

/**
 * Format a measurement as a string (e.g., "5-3/16")
 */
export function formatMeasurement(inches: number): string {
  const whole = Math.floor(inches);
  const fraction = inches - whole;
  
  if (fraction === 0) return `${whole}"`;
  
  // Convert to nearest 16th
  const sixteenths = Math.round(fraction * 16);
  if (sixteenths === 0) return `${whole}"`;
  if (sixteenths === 16) return `${whole + 1}"`;
  
  // Simplify fraction
  let numerator = sixteenths;
  let denominator = 16;
  
  // Reduce fraction
  while (numerator % 2 === 0 && denominator % 2 === 0) {
    numerator /= 2;
    denominator /= 2;
  }
  
  if (whole === 0) {
    return `${numerator}/${denominator}"`;
  }
  return `${whole}-${numerator}/${denominator}"`;
}

/**
 * Calculate an offset bend
 * Uses the multiplier method: distance = obstruction_height × multiplier
 */
export function calculateOffset(input: OffsetInput): OffsetResult {
  const { obstructionHeight, angle, conduitSize, advanceDistance = 0 } = input;
  
  if (obstructionHeight <= 0) {
    throw new Error('Obstruction height must be greater than 0');
  }
  
  const multiplier = OFFSET_MULTIPLIERS[angle];
  const distanceBetweenBends = roundToSixteenth(obstructionHeight * multiplier);
  const shrinkage = roundToSixteenth(obstructionHeight * SHRINKAGE_FACTORS[angle]);
  const gain = roundToSixteenth(GAIN_VALUES[angle]);
  
  const notes: string[] = [];
  
  // Add warning for shallow angles with large offsets
  if (angle <= 22.5 && obstructionHeight > 12) {
    notes.push('⚠️ Shallow angle with large offset may require significant bend spacing.');
  }
  
  // Add note for small conduit
  if (conduitSize === '1/2' && angle >= 60) {
    notes.push('⚠️ 60° bends in 1/2" conduit may be difficult. Consider 45° instead.');
  }
  
  // Add practical tip
  if (angle === 30) {
    notes.push('💡 30° offset is the most common - easy to pull wire and good clearance.');
  } else if (angle === 45) {
    notes.push('💡 45° offset saves space but is harder to pull wire through.');
  }
  
  return {
    obstructionHeight,
    angle,
    multiplier,
    distanceBetweenBends,
    shrinkage,
    bendMarks: {
      firstBend: advanceDistance,
      secondBend: roundToSixteenth(advanceDistance + distanceBetweenBends),
    },
    gain,
    notes,
  };
}

/**
 * Calculate a saddle bend (3-point or 4-point)
 * 3-point: one center bend, two outer bends
 * 4-point: two center bends, two outer bends (for wider obstructions)
 */
export function calculateSaddle(input: SaddleInput): SaddleResult {
  const { obstructionWidth, angle, conduitSize, saddleType, offsetCenter = 0 } = input;
  
  if (obstructionWidth <= 0) {
    throw new Error('Obstruction width must be greater than 0');
  }
  
  const multiplier = OFFSET_MULTIPLIERS[angle];
  const shrinkage = roundToSixteenth(obstructionWidth * SHRINKAGE_FACTORS[angle] * 0.5);
  const notes: string[] = [];
  
  let marks: number[];
  
  if (saddleType === '3pt') {
    // 3-point saddle: center bend + two side bends
    // Center bend is 2× the angle (e.g., 30° side bends = 60° center)
    // This is a simplification - actual practice varies
    const halfWidth = obstructionWidth / 2;
    const bendSpacing = roundToSixteenth(halfWidth * multiplier);
    
    marks = [
      offsetCenter - bendSpacing,  // First side bend
      offsetCenter,                 // Center bend (opposite direction)
      offsetCenter + bendSpacing,   // Second side bend
    ];
    
    notes.push('💡 Center bend goes opposite direction from side bends.');
    notes.push(`Side bends at ${angle}°, center bend at ${Math.min(angle * 2, 60)}°.`);
    
    if (angle > 30) {
      notes.push('⚠️ Use 30° or less for 3-point saddles to avoid over-bending.');
    }
  } else {
    // 4-point saddle: two center bends, two outer bends
    // Better for wider obstructions
    const quarterWidth = obstructionWidth / 4;
    const bendSpacing = roundToSixteenth(quarterWidth * multiplier);
    
    marks = [
      offsetCenter - (bendSpacing * 2),  // First outer bend
      offsetCenter - bendSpacing,        // First inner bend
      offsetCenter + bendSpacing,        // Second inner bend
      offsetCenter + (bendSpacing * 2),  // Second outer bend
    ];
    
    notes.push('💡 Inner bends face down (toward obstruction), outer bends face up.');
    notes.push('All bends use same angle.');
  }
  
  // Add conduit-specific notes
  if (conduitSize === '1/2') {
    notes.push('💡 For 1/2" conduit, use 3-point saddle only for small obstructions (<6").');
  }
  
  return {
    obstructionWidth,
    angle,
    saddleType,
    centerPoint: offsetCenter,
    marks,
    shrinkage,
    notes,
  };
}

/**
 * Calculate a 90-degree bend
 * Take-up is the amount the conduit grows when bent
 */
export function calculateNinety(input: NinetyInput): NinetyResult {
  const { conduitSize, legLength } = input;
  
  if (legLength <= 0) {
    throw new Error('Leg length must be greater than 0');
  }
  
  const takeUp = TAKE_UP_VALUES[conduitSize];
  const cutLength = legLength + takeUp;
  const bendMark = takeUp; // Measure back from end
  
  const notes: string[] = [
    `💡 Measure ${formatMeasurement(takeUp)} from end and mark for bend.`,
    'Align mark with arrow on bender.',
  ];
  
  if (conduitSize >= '2') {
    notes.push('⚠️ Use hydraulic bender for 2" and larger conduit.');
  }
  
  return {
    conduitSize,
    takeUp,
    legLength,
    cutLength,
    bendMark,
    notes,
  };
}

/**
 * Calculate a rolling offset
 * Used when offsetting around an obstruction at an angle
 */
export function calculateRollingOffset(input: RollingOffsetInput): RollingOffsetResult {
  const { verticalOffset, horizontalOffset, angle, conduitSize } = input;
  
  if (verticalOffset <= 0 || horizontalOffset <= 0) {
    throw new Error('Both vertical and horizontal offsets must be greater than 0');
  }
  
  // True offset (hypotenuse of right triangle)
  const rollingOffset = Math.sqrt(verticalOffset ** 2 + horizontalOffset ** 2);
  
  const multiplier = OFFSET_MULTIPLIERS[angle];
  const distanceBetweenBends = roundToSixteenth(rollingOffset * multiplier);
  const shrinkage = roundToSixteenth(rollingOffset * SHRINKAGE_FACTORS[angle]);
  const travelLength = roundToSixteenth(distanceBetweenBends);
  
  const notes: string[] = [
    `📐 True offset = ${formatMeasurement(roundToSixteenth(rollingOffset))}`,
    'Measure first bend perpendicular to starting conduit.',
    'Measure second bend parallel to ending conduit.',
  ];
  
  // Add calculation tip
  notes.push(`Formula: √(${verticalOffset}² + ${horizontalOffset}²) = ${roundToSixteenth(rollingOffset).toFixed(3)}"`);
  
  return {
    verticalOffset,
    horizontalOffset,
    angle,
    rollingOffset: roundToSixteenth(rollingOffset),
    multiplier,
    distanceBetweenBends,
    shrinkage,
    travelLength,
    notes,
  };
}

/**
 * Get recommended bend angle based on obstruction height
 * Returns the best angle for the given situation
 */
export function recommendAngle(obstructionHeight: number, availableSpace: number): BendAngle {
  // If space is tight, use shallower angle
  const ratio = availableSpace / obstructionHeight;
  
  if (ratio >= 5) return 30; // Plenty of space, use standard 30°
  if (ratio >= 3) return 22.5; // Moderate space
  if (ratio >= 1.5) return 45; // Tight space, steeper angle
  return 60; // Very tight space
}

/**
 * Get a quick reference table for common offsets
 */
export function getOffsetQuickReference(angle: BendAngle): { offset: number; spacing: string }[] {
  const multiplier = OFFSET_MULTIPLIERS[angle];
  const offsets = [1, 2, 3, 4, 6, 8, 12, 18, 24];
  
  return offsets.map(offset => ({
    offset,
    spacing: formatMeasurement(roundToSixteenth(offset * multiplier)),
  }));
}
