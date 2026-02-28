/**
 * Pipe Bending Calculator Types
 * Supports offset, saddle, 90-degree, and rolling offset calculations
 */

export type ConduitSize = '1/2' | '3/4' | '1' | '1-1/4' | '1-1/2' | '2' | '2-1/2' | '3' | '4';

export type BendAngle = 10 | 22.5 | 30 | 45 | 60;

export type BendType = 'offset' | 'saddle-3pt' | 'saddle-4pt' | 'ninety' | 'rolling-offset';

export interface OffsetInput {
  obstructionHeight: number; // inches
  angle: BendAngle;
  conduitSize: ConduitSize;
  advanceDistance?: number; // optional - distance from last bend to start
}

export interface OffsetResult {
  obstructionHeight: number;
  angle: BendAngle;
  multiplier: number;
  distanceBetweenBends: number;
  shrinkage: number;
  bendMarks: {
    firstBend: number;
    secondBend: number;
  };
  gain: number;
  notes: string[];
}

export interface SaddleInput {
  obstructionWidth: number; // inches
  angle: BendAngle;
  conduitSize: ConduitSize;
  saddleType: '3pt' | '4pt';
  offsetCenter?: number; // distance from reference to center of obstruction
}

export interface SaddleResult {
  obstructionWidth: number;
  angle: BendAngle;
  saddleType: '3pt' | '4pt';
  centerPoint: number;
  marks: number[];
  shrinkage: number;
  notes: string[];
}

export interface NinetyInput {
  conduitSize: ConduitSize;
  legLength: number; // length of the 90 leg (from back of 90 to end)
}

export interface NinetyResult {
  conduitSize: ConduitSize;
  takeUp: number;
  legLength: number;
  cutLength: number; // total cut length needed
  bendMark: number; // where to mark for the bend
  notes: string[];
}

export interface RollingOffsetInput {
  verticalOffset: number; // rise
  horizontalOffset: number; // run
  angle: BendAngle;
  conduitSize: ConduitSize;
}

export interface RollingOffsetResult {
  verticalOffset: number;
  horizontalOffset: number;
  angle: BendAngle;
  rollingOffset: number; // true offset (hypotenuse)
  multiplier: number;
  distanceBetweenBends: number;
  shrinkage: number;
  travelLength: number; // center-to-center distance
  notes: string[];
}

// Multiplier table for common bend angles
// Based on cosecant of the bend angle (1 / sin(angle))
export const OFFSET_MULTIPLIERS: Record<BendAngle, number> = {
  10: 5.76,
  22.5: 2.61,
  30: 2.0,
  45: 1.414,
  60: 1.155,
};

// Shrinkage factor per inch of offset (approximate)
export const SHRINKAGE_FACTORS: Record<BendAngle, number> = {
  10: 1/64, // 1/8" per 1" of offset over distance
  22.5: 3/64,
  30: 1/4,
  45: 3/8,
  60: 1/2,
};

// Take-up values for 90-degree bends (approximate, varies by bender)
// These are typical values for standard hand benders
export const TAKE_UP_VALUES: Record<ConduitSize, number> = {
  '1/2': 5,
  '3/4': 6,
  '1': 8,
  '1-1/4': 10,
  '1-1/2': 12,
  '2': 15,
  '2-1/2': 18,
  '3': 22,
  '4': 28,
};

// Deduction (gain) values for offset bends (approximate)
export const GAIN_VALUES: Record<BendAngle, number> = {
  10: 1/16,
  22.5: 1/8,
  30: 1/4,
  45: 3/8,
  60: 1/2,
};
