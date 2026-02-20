/**
 * Conductor ampacity for motor circuits
 * Based on NEC Table 310.16 (formerly 310.15(B)(16))
 * Values for conductors in raceway/cable at 30°C ambient
 */

export type ConductorSize = '14' | '12' | '10' | '8' | '6' | '4' | '3' | '2' | '1' | '1/0' | '2/0' | '3/0' | '4/0' | '250' | '300' | '350' | '400' | '500';

interface AmpacityTable {
  copper: Record<60 | 75 | 90, number>;
  aluminum: Record<60 | 75 | 90, number>;
}

export const motorConductorAmpacity: Record<ConductorSize, AmpacityTable> = {
  '14': {
    copper: { 60: 15, 75: 20, 90: 25 },
    aluminum: { 60: 0, 75: 0, 90: 0 }, // Not rated for aluminum
  },
  '12': {
    copper: { 60: 20, 75: 25, 90: 30 },
    aluminum: { 60: 15, 75: 20, 90: 25 },
  },
  '10': {
    copper: { 60: 30, 75: 35, 90: 40 },
    aluminum: { 60: 25, 75: 30, 90: 35 },
  },
  // Note: 10* and 12* in NEC indicates 240.4(D) restrictions apply
  '8': {
    copper: { 60: 40, 75: 50, 90: 55 },
    aluminum: { 60: 30, 75: 40, 90: 45 },
  },
  '6': {
    copper: { 60: 55, 75: 65, 90: 75 },
    aluminum: { 60: 40, 75: 50, 90: 55 },
  },
  '4': {
    copper: { 60: 70, 75: 85, 90: 95 },
    aluminum: { 60: 55, 75: 65, 90: 75 },
  },
  '3': {
    copper: { 60: 85, 75: 100, 90: 115 },
    aluminum: { 60: 65, 75: 75, 90: 85 },
  },
  '2': {
    copper: { 60: 95, 75: 115, 90: 130 },
    aluminum: { 60: 75, 75: 90, 90: 100 },
  },
  '1': {
    copper: { 60: 110, 75: 130, 90: 145 },
    aluminum: { 60: 85, 75: 100, 90: 115 },
  },
  '1/0': {
    copper: { 60: 125, 75: 150, 90: 170 },
    aluminum: { 60: 100, 75: 120, 90: 135 },
  },
  '2/0': {
    copper: { 60: 145, 75: 175, 90: 195 },
    aluminum: { 60: 115, 75: 135, 90: 150 },
  },
  '3/0': {
    copper: { 60: 165, 75: 200, 90: 225 },
    aluminum: { 60: 130, 75: 155, 90: 175 },
  },
  '4/0': {
    copper: { 60: 195, 75: 230, 90: 260 },
    aluminum: { 60: 150, 75: 180, 90: 205 },
  },
  '250': {
    copper: { 60: 215, 75: 255, 90: 290 },
    aluminum: { 60: 170, 75: 205, 90: 230 },
  },
  '300': {
    copper: { 60: 240, 75: 285, 90: 320 },
    aluminum: { 60: 195, 75: 230, 90: 260 },
  },
  '350': {
    copper: { 60: 260, 75: 310, 90: 350 },
    aluminum: { 60: 210, 75: 250, 90: 280 },
  },
  '400': {
    copper: { 60: 280, 75: 335, 90: 380 },
    aluminum: { 60: 225, 75: 270, 90: 305 },
  },
  '500': {
    copper: { 60: 320, 75: 380, 90: 430 },
    aluminum: { 60: 260, 75: 310, 90: 350 },
  },
};

export const conductorSizeOrder: ConductorSize[] = [
  '14', '12', '10', '8', '6', '4', '3', '2', '1',
  '1/0', '2/0', '3/0', '4/0',
  '250', '300', '350', '400', '500',
];

/**
 * Find the smallest conductor size that meets the minimum ampacity requirement
 */
export function findConductorSize(
  minAmpacity: number,
  material: 'copper' | 'aluminum',
  terminalRating: 60 | 75 | 90
): ConductorSize | null {
  for (const size of conductorSizeOrder) {
    const ampacity = motorConductorAmpacity[size][material][terminalRating];
    if (ampacity >= minAmpacity) {
      return size;
    }
  }
  return null; // No conductor size meets requirement
}
