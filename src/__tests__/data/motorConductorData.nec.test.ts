/**
 * NEC Table 310.16 Compliance Tests
 * Validates conductor ampacity data matches NEC 2023 standards
 */

import { motorConductorAmpacity, findConductorSize, conductorSizeOrder } from '../../data/motor-conductor-data';
import type { ConductorSize } from '../../data/motor-conductor-data';

// NEC Table 310.16 data from official extraction (cwp-data/nec_table_310_16_cleaned.json)
const necTable310_16 = {
  '14': { cu_60: 15, cu_75: 20, cu_90: 25, al_60: null, al_75: null, al_90: null },
  '12': { cu_60: 20, cu_75: 25, cu_90: 30, al_60: 15, al_75: 20, al_90: 25 },
  '10': { cu_60: 30, cu_75: 35, cu_90: 40, al_60: 25, al_75: 30, al_90: 35 },
  '8': { cu_60: 40, cu_75: 50, cu_90: 55, al_60: 30, al_75: 40, al_90: 45 },
  '6': { cu_60: 55, cu_75: 65, cu_90: 75, al_60: 40, al_75: 50, al_90: 55 },
  '4': { cu_60: 70, cu_75: 85, cu_90: 95, al_60: 55, al_75: 65, al_90: 75 },
  '3': { cu_60: 85, cu_75: 100, cu_90: 115, al_60: 65, al_75: 75, al_90: 85 },
  '2': { cu_60: 95, cu_75: 115, cu_90: 130, al_60: 75, al_75: 90, al_90: 100 },
  '1': { cu_60: 110, cu_75: 130, cu_90: 145, al_60: 85, al_75: 100, al_90: 115 },
  '1/0': { cu_60: 125, cu_75: 150, cu_90: 170, al_60: 100, al_75: 120, al_90: 135 },
  '2/0': { cu_60: 145, cu_75: 175, cu_90: 195, al_60: 115, al_75: 135, al_90: 150 },
  '3/0': { cu_60: 165, cu_75: 200, cu_90: 225, al_60: 130, al_75: 155, al_90: 175 },
  '4/0': { cu_60: 195, cu_75: 230, cu_90: 260, al_60: 150, al_75: 180, al_90: 205 },
  '250': { cu_60: 215, cu_75: 255, cu_90: 290, al_60: 170, al_75: 205, al_90: 230 },
  '300': { cu_60: 240, cu_75: 285, cu_90: 320, al_60: 195, al_75: 230, al_90: 260 },
  '350': { cu_60: 260, cu_75: 310, cu_90: 350, al_60: 210, al_75: 250, al_90: 280 },
  '400': { cu_60: 280, cu_75: 335, cu_90: 380, al_60: 225, al_75: 270, al_90: 305 },
  '500': { cu_60: 320, cu_75: 380, cu_90: 430, al_60: 260, al_75: 310, al_90: 350 },
};

describe('NEC Table 310.16 Compliance', () => {
  describe('Copper Ampacities', () => {
    Object.entries(necTable310_16).forEach(([size, values]) => {
      if (values.cu_60 !== null) {
        test(`${size} AWG 60°C matches NEC`, () => {
          expect(motorConductorAmpacity[size as ConductorSize].copper[60]).toBe(values.cu_60);
        });
      }
      
      if (values.cu_75 !== null) {
        test(`${size} AWG 75°C matches NEC`, () => {
          expect(motorConductorAmpacity[size as ConductorSize].copper[75]).toBe(values.cu_75);
        });
      }
      
      if (values.cu_90 !== null) {
        test(`${size} AWG 90°C matches NEC`, () => {
          expect(motorConductorAmpacity[size as ConductorSize].copper[90]).toBe(values.cu_90);
        });
      }
    });
  });

  describe('Aluminum Ampacities', () => {
    Object.entries(necTable310_16).forEach(([size, values]) => {
      if (values.al_60 !== null) {
        test(`${size} AWG 60°C matches NEC`, () => {
          expect(motorConductorAmpacity[size as ConductorSize].aluminum[60]).toBe(values.al_60);
        });
      }
      
      if (values.al_75 !== null) {
        test(`${size} AWG 75°C matches NEC`, () => {
          expect(motorConductorAmpacity[size as ConductorSize].aluminum[75]).toBe(values.al_75);
        });
      }
      
      if (values.al_90 !== null) {
        test(`${size} AWG 90°C matches NEC`, () => {
          expect(motorConductorAmpacity[size as ConductorSize].aluminum[90]).toBe(values.al_90);
        });
      }
    });
  });
});

describe('findConductorSize', () => {
  test('finds correct size for small motor circuit', () => {
    // 5 HP @ 240V 3ph = 6.6A FLA × 1.25 = 8.25A → #14 AWG
    expect(findConductorSize(9, 'copper', 75)).toBe('14');
  });

  test('finds correct size for medium motor circuit', () => {
    // 10 HP @ 480V 3ph = 6.1A FLA × 1.25 = 7.6A → #14 AWG
    expect(findConductorSize(8, 'copper', 75)).toBe('14');
  });

  test('finds correct size for larger motor with copper', () => {
    // 50 HP @ 480V 3ph = 28.4A FLA × 1.25 = 35.5A → #8 AWG (50A) since #10 is 35A (too small)
    expect(findConductorSize(36, 'copper', 75)).toBe('8');
  });

  test('finds correct size for aluminum conductor', () => {
    // Same 50 HP motor but aluminum = 35.5A → #8 AWG (40A AL @ 75°C)
    expect(findConductorSize(36, 'aluminum', 75)).toBe('8');
  });

  test('respects terminal temperature rating', () => {
    // 100 HP @ 480V = 54.2A FLA × 1.25 = 67.75A
    // At 60°C: #2 CU = 95A, #3 CU = 85A, #4 CU = 70A ✓
    expect(findConductorSize(68, 'copper', 60)).toBe('4');
    // At 75°C: #6 CU = 65A (too small), #4 CU = 85A ✓
    expect(findConductorSize(68, 'copper', 75)).toBe('4');
  });

  test('handles continuous load multiplier correctly', () => {
    // 30 HP @ 480V continuous = 17.5A FLA × 1.25 × 1.25 = 27.3A → #10 AWG (35A)
    expect(findConductorSize(28, 'copper', 75)).toBe('10');
  });

  test('returns null for extremely high ampacity requirement', () => {
    expect(findConductorSize(1000, 'copper', 75)).toBeNull();
  });

  test('correctly sizes large motor circuit', () => {
    // 200 HP @ 480V = 105A FLA × 1.25 = 131.25A
    // #1/0 CU @ 75°C = 150A
    expect(findConductorSize(132, 'copper', 75)).toBe('1/0');
  });

  test('aluminum requires larger size than copper for same ampacity', () => {
    const ampacity = 100;
    const copperSize = findConductorSize(ampacity, 'copper', 75);
    const aluminumSize = findConductorSize(ampacity, 'aluminum', 75);
    // Aluminum should require equal or larger size
    const copperIndex = conductorSizeOrder.indexOf(copperSize!);
    const aluminumIndex = conductorSizeOrder.indexOf(aluminumSize!);
    expect(aluminumIndex).toBeGreaterThanOrEqual(copperIndex);
  });
});

describe('Critical Bug Fixes Validation', () => {
  test('1 AWG Copper 90°C is 145A (was incorrectly 150A)', () => {
    expect(motorConductorAmpacity['1'].copper[90]).toBe(145);
  });

  test('300 kcmil Aluminum 60°C is 195A (was incorrectly 190A)', () => {
    expect(motorConductorAmpacity['300'].aluminum[60]).toBe(195);
  });

  test('300 kcmil Aluminum 90°C is 260A (was incorrectly 255A)', () => {
    expect(motorConductorAmpacity['300'].aluminum[90]).toBe(260);
  });

  test('12 AWG Copper 60°C is 20A (was incorrectly 25A)', () => {
    expect(motorConductorAmpacity['12'].copper[60]).toBe(20);
  });

  test('12 AWG Aluminum 60°C is 15A (was incorrectly 20A)', () => {
    expect(motorConductorAmpacity['12'].aluminum[60]).toBe(15);
  });
});
