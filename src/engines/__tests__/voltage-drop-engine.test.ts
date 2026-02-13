/**
 * Voltage Drop Engine Tests
 * 
 * Verifies:
 * 1. Resistance values match CRC Handbook formula: R = ρ × 1000 / A_cmil
 * 2. Voltage drop calculations are mathematically correct
 * 3. Wire recommendations work properly
 */

import { wireResistances } from '../../data/resistance-data';
import { calculateVoltageDrop, recommendWire, formatWireSize } from '../voltage-drop-engine';

const CU_RHO = 10.371;
const AL_RHO = 17.002;

describe('Resistance Data', () => {
  test('copper resistivity formula matches for #14 AWG', () => {
    const wire14 = wireResistances.find(w => w.awg === '14')!;
    const expected = Math.round((CU_RHO * 1000 / 4110) * 10000) / 10000;
    expect(wire14.copperR).toBe(expected);
  });

  test('aluminum resistivity formula matches for #12 AWG', () => {
    const wire12 = wireResistances.find(w => w.awg === '12')!;
    const expected = Math.round((AL_RHO * 1000 / 6530) * 10000) / 10000;
    expect(wire12.aluminumR).toBe(expected);
  });

  test('all wire sizes have positive resistance values', () => {
    for (const wire of wireResistances) {
      expect(wire.copperR).toBeGreaterThan(0);
      expect(wire.aluminumR).toBeGreaterThan(0);
      expect(wire.aluminumR).toBeGreaterThan(wire.copperR); // Al always higher
    }
  });

  test('resistance decreases as wire size increases', () => {
    for (let i = 1; i < wireResistances.length; i++) {
      expect(wireResistances[i].copperR).toBeLessThan(wireResistances[i - 1].copperR);
    }
  });

  test('all 21 wire sizes present', () => {
    expect(wireResistances.length).toBe(21);
  });
});

describe('Voltage Drop Calculation', () => {
  test('single-phase 120V 20A 100ft #12 Cu', () => {
    const result = calculateVoltageDrop({
      voltage: 120, phase: 1, current: 20, distance: 100,
      material: 'copper', wireSize: '12',
    });
    expect(result).not.toBeNull();
    // VD = 2 × 20 × R × 100 / 1000
    const wire12 = wireResistances.find(w => w.awg === '12')!;
    const expectedVD = Math.round((2 * 20 * wire12.copperR * 100 / 1000) * 100) / 100;
    expect(result!.voltageDrop).toBe(expectedVD);
    expect(result!.voltageAtLoad).toBe(Math.round((120 - expectedVD) * 100) / 100);
  });

  test('three-phase uses sqrt(3) multiplier', () => {
    const result = calculateVoltageDrop({
      voltage: 480, phase: 3, current: 50, distance: 200,
      material: 'copper', wireSize: '6',
    });
    expect(result).not.toBeNull();
    const wire6 = wireResistances.find(w => w.awg === '6')!;
    const expectedVD = Math.round((Math.sqrt(3) * 50 * wire6.copperR * 200 / 1000) * 100) / 100;
    expect(result!.voltageDrop).toBe(expectedVD);
  });

  test('invalid wire size returns null', () => {
    const result = calculateVoltageDrop({
      voltage: 120, phase: 1, current: 20, distance: 100,
      material: 'copper', wireSize: '99',
    });
    expect(result).toBeNull();
  });
});

describe('Wire Recommendation', () => {
  test('recommends a wire for standard residential circuit', () => {
    const rec = recommendWire({
      voltage: 120, phase: 1, current: 20, distance: 75,
      material: 'copper',
    });
    expect(rec.bestChoice).not.toBeNull();
    expect(rec.bestChoice!.passes3Percent).toBe(true);
  });

  test('long run requires larger wire', () => {
    const short = recommendWire({
      voltage: 120, phase: 1, current: 20, distance: 50, material: 'copper',
    });
    const long = recommendWire({
      voltage: 120, phase: 1, current: 20, distance: 300, material: 'copper',
    });
    if (short.bestChoice && long.bestChoice) {
      const shortIdx = wireResistances.findIndex(w => w.awg === short.bestChoice!.wireSize);
      const longIdx = wireResistances.findIndex(w => w.awg === long.bestChoice!.wireSize);
      expect(longIdx).toBeGreaterThanOrEqual(shortIdx);
    }
  });
});

describe('Format Wire Size', () => {
  test('formats AWG sizes correctly', () => {
    expect(formatWireSize('12')).toBe('#12 AWG');
    expect(formatWireSize('4/0')).toBe('#4/0 AWG');
  });

  test('formats kcmil sizes correctly', () => {
    expect(formatWireSize('250')).toBe('250 kcmil');
    expect(formatWireSize('500')).toBe('500 kcmil');
  });
});
