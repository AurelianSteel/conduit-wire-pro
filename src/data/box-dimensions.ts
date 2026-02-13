/**
 * Box Fill Calculator - Box Dimensions Data
 * Standard electrical box sizes with cubic inch capacities
 */

export type BoxType = 'round' | 'square' | 'device' | 'masonry';

export interface BoxSize {
  id: string;
  name: string;
  volumeIn3: number;
  type: BoxType;
}

export interface ConductorEntry {
  awg: number;
  quantity: number;
}

// Round/Octagon Boxes (NEC Table 314.16(A))
export const ROUND_BOXES: BoxSize[] = [
  { id: 'round-3.5x1.25', name: '3-1/2" × 3-1/2" × 1-1/4"', volumeIn3: 6.5, type: 'round' },
  { id: 'round-3.5x1.5', name: '3-1/2" × 3-1/2" × 1-1/2"', volumeIn3: 8.0, type: 'round' },
  { id: 'round-3.5x2.125', name: '3-1/2" × 3-1/2" × 2-1/8"', volumeIn3: 11.0, type: 'round' },
  { id: 'round-4x1.25', name: '4" × 4" × 1-1/4"', volumeIn3: 12.5, type: 'round' },
  { id: 'round-4x1.5', name: '4" × 4" × 1-1/2"', volumeIn3: 15.5, type: 'round' },
  { id: 'round-4x2.125', name: '4" × 4" × 2-1/8"', volumeIn3: 21.5, type: 'round' },
];

// Square Boxes (NEC Table 314.16(A))
export const SQUARE_BOXES: BoxSize[] = [
  { id: 'square-4x1.25', name: '4" × 4" × 1-1/4"', volumeIn3: 18.0, type: 'square' },
  { id: 'square-4x1.5', name: '4" × 4" × 1-1/2"', volumeIn3: 21.0, type: 'square' },
  { id: 'square-4x2.125', name: '4" × 4" × 2-1/8"', volumeIn3: 30.3, type: 'square' },
  { id: 'square-4.6875x1.25', name: '4-11/16" × 4-11/16" × 1-1/4"', volumeIn3: 25.5, type: 'square' },
  { id: 'square-4.6875x1.5', name: '4-11/16" × 4-11/16" × 1-1/2"', volumeIn3: 29.5, type: 'square' },
  { id: 'square-4.6875x2.125', name: '4-11/16" × 4-11/16" × 2-1/8"', volumeIn3: 42.0, type: 'square' },
  { id: 'square-4.6875x2.5', name: '4-11/16" × 4-11/16" × 2-1/2"', volumeIn3: 49.0, type: 'square' },
  { id: 'square-5x1.25', name: '5" × 5" × 1-1/4"', volumeIn3: 33.0, type: 'square' },
  { id: 'square-5x1.5', name: '5" × 5" × 1-1/2"', volumeIn3: 37.5, type: 'square' },
  { id: 'square-5x2.125', name: '5" × 5" × 2-1/8"', volumeIn3: 52.5, type: 'square' },
  { id: 'square-5x2.5', name: '5" × 5" × 2-1/2"', volumeIn3: 62.5, type: 'square' },
];

// Device Boxes (NEC Table 314.16(A))
export const DEVICE_BOXES: BoxSize[] = [
  { id: 'device-3x2x1.5', name: '3" × 2" × 1-1/2"', volumeIn3: 7.5, type: 'device' },
  { id: 'device-3x2x2', name: '3" × 2" × 2"', volumeIn3: 10.0, type: 'device' },
  { id: 'device-3x2x2.25', name: '3" × 2" × 2-1/4"', volumeIn3: 10.5, type: 'device' },
  { id: 'device-3x2x2.5', name: '3" × 2" × 2-1/2"', volumeIn3: 12.5, type: 'device' },
  { id: 'device-3x2x2.75', name: '3" × 2" × 2-3/4"', volumeIn3: 14.0, type: 'device' },
  { id: 'device-3x2x3.5', name: '3" × 2" × 3-1/2"', volumeIn3: 18.0, type: 'device' },
  { id: 'device-3.75x2x2', name: '3-3/4" × 2" × 2"', volumeIn3: 11.0, type: 'device' },
  { id: 'device-3.75x2x2.5', name: '3-3/4" × 2" × 2-1/2"', volumeIn3: 14.5, type: 'device' },
  { id: 'device-3.75x2x3', name: '3-3/4" × 2" × 3"', volumeIn3: 18.0, type: 'device' },
  { id: 'device-3.75x2x3.5', name: '3-3/4" × 2" × 3-1/2"', volumeIn3: 21.0, type: 'device' },
  { id: 'device-4x2.125x1.875', name: '4" × 2-1/8" × 1-7/8"', volumeIn3: 14.0, type: 'device' },
  { id: 'device-4x2.125x2.125', name: '4" × 2-1/8" × 2-1/8"', volumeIn3: 16.0, type: 'device' },
  { id: 'device-4x2.125x2.5', name: '4" × 2-1/8" × 2-1/2"', volumeIn3: 19.0, type: 'device' },
];

// Masonry/FS/FD Boxes (NEC Table 314.16(A))
export const MASONRY_BOXES: BoxSize[] = [
  { id: 'masonry-fs-single', name: 'FS Single (1-3/4")', volumeIn3: 13.5, type: 'masonry' },
  { id: 'masonry-fd-single', name: 'FD Single (2-3/8")', volumeIn3: 18.0, type: 'masonry' },
  { id: 'masonry-fs-double', name: 'FS Double (1-3/4")', volumeIn3: 18.0, type: 'masonry' },
  { id: 'masonry-fd-double', name: 'FD Double (2-3/8")', volumeIn3: 24.0, type: 'masonry' },
];

// All boxes combined
export const ALL_BOXES: BoxSize[] = [
  ...ROUND_BOXES,
  ...SQUARE_BOXES,
  ...DEVICE_BOXES,
  ...MASONRY_BOXES,
];

// Conductor volume allowances by AWG (cubic inches per conductor)
export const CONDUCTOR_VOLUMES: Record<number, number> = {
  14: 2.00,
  12: 2.25,
  10: 2.50,
  8: 3.00,
  6: 5.00,
};

/**
 * Get the volume allowance for a conductor based on AWG size
 * @param awg - Wire gauge (14, 12, 10, 8, or 6)
 * @returns Volume in cubic inches, or null if AWG not supported
 */
export function getConductorVolume(awg: number): number | null {
  return CONDUCTOR_VOLUMES[awg] ?? null;
}

/**
 * Get all supported AWG sizes
 * @returns Array of supported AWG sizes
 */
export function getSupportedAWGSizes(): number[] {
  return Object.keys(CONDUCTOR_VOLUMES).map(Number).sort((a, b) => a - b);
}
