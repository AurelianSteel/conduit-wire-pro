/**
 * Transformer Service Tests
 * Tests transformer calculations per NEC 450
 */

import {
  calculateKVA,
  calculateFLA,
  calculateFaultCurrent,
  sizeOCPD,
  getNextStandardBreakerSize,
  calculateTurnsRatio,
  calculateTransformerSpecs,
  getTypicalImpedance,
  calculateMinimumTransformerSize,
  formatAmps,
  formatKVA,
} from '../../services/transformerService';
import {
  TransformerInput,
  TransformerPhase,
  STANDARD_BREAKER_SIZES,
} from '../../types/transformer';

describe('Transformer Service', () => {
  describe('calculateKVA', () => {
    it('calculates single-phase KVA correctly', () => {
      // 100A at 240V single-phase = 24 KVA
      expect(calculateKVA(100, 240, 'single')).toBe(24);
    });

    it('calculates three-phase KVA correctly', () => {
      // 100A at 480V three-phase = 83.14 KVA (100 * 480 * 1.732 / 1000)
      const result = calculateKVA(100, 480, 'three');
      expect(result).toBeCloseTo(83.14, 1);
    });

    it('throws error for zero amps', () => {
      expect(() => calculateKVA(0, 240, 'single')).toThrow();
    });

    it('throws error for zero volts', () => {
      expect(() => calculateKVA(100, 0, 'single')).toThrow();
    });

    it('throws error for negative values', () => {
      expect(() => calculateKVA(-10, 240, 'single')).toThrow();
    });
  });

  describe('calculateFLA', () => {
    it('calculates single-phase FLA correctly', () => {
      // 75 KVA at 240V single-phase = 312.5 A
      expect(calculateFLA(75, 240, 'single')).toBe(312.5);
    });

    it('calculates three-phase FLA correctly', () => {
      // 75 KVA at 480V three-phase = 90.2 A (75000 / (480 * 1.732))
      const result = calculateFLA(75, 480, 'three');
      expect(result).toBeCloseTo(90.21, 1);
    });

    it('calculates 100 KVA at 208V three-phase correctly', () => {
      // Common transformer calculation
      const result = calculateFLA(100, 208, 'three');
      expect(result).toBeCloseTo(277.6, 1);
    });

    it('throws error for zero KVA', () => {
      expect(() => calculateFLA(0, 240, 'single')).toThrow();
    });

    it('throws error for zero voltage', () => {
      expect(() => calculateFLA(50, 0, 'single')).toThrow();
    });
  });

  describe('calculateFaultCurrent', () => {
    it('calculates fault current correctly for 2% impedance', () => {
      // 100A FLA with 2% impedance = 5000A fault current
      expect(calculateFaultCurrent(100, 2)).toBe(5000);
    });

    it('calculates fault current correctly for 1.5% impedance', () => {
      // 90A FLA with 1.5% impedance = 6000A fault current
      const result = calculateFaultCurrent(90, 1.5);
      expect(result).toBe(6000);
    });

    it('throws error for zero FLA', () => {
      expect(() => calculateFaultCurrent(0, 2)).toThrow();
    });

    it('throws error for zero impedance', () => {
      expect(() => calculateFaultCurrent(100, 0)).toThrow();
    });

    it('throws error for impedance > 20%', () => {
      expect(() => calculateFaultCurrent(100, 25)).toThrow();
    });
  });

  describe('getNextStandardBreakerSize', () => {
    it('returns exact size if standard', () => {
      expect(getNextStandardBreakerSize(100)).toBe(100);
    });

    it('returns next size up if not standard', () => {
      expect(getNextStandardBreakerSize(105)).toBe(110);
    });

    it('handles values between 100 and 125', () => {
      expect(getNextStandardBreakerSize(115)).toBe(125);
    });

    it('handles large values', () => {
      expect(getNextStandardBreakerSize(450)).toBe(450);
      expect(getNextStandardBreakerSize(455)).toBe(500);
    });

    it('handles very large standard values', () => {
      // 6500 is a standard size
      expect(getNextStandardBreakerSize(6500)).toBe(6500);
    });

    it('rounds up very large non-standard values to nearest 100', () => {
      expect(getNextStandardBreakerSize(6550)).toBe(6600);
    });
  });

  describe('sizeOCPD', () => {
    it('sizes OCPD at 125% for standard case', () => {
      // 100A FLA * 1.25 = 125A → next standard = 125A
      expect(sizeOCPD(100, 125)).toBe(125);
    });

    it('rounds up to next standard size', () => {
      // 90A FLA * 1.25 = 112.5A → next standard = 125A
      expect(sizeOCPD(90, 125)).toBe(125);
    });

    it('uses default 125% when percentage not specified', () => {
      // 100A * 1.25 = 125A
      expect(sizeOCPD(100)).toBe(125);
    });

    it('handles 300% protection for high-voltage transformers', () => {
      // 50A FLA * 3.0 = 150A
      expect(sizeOCPD(50, 300)).toBe(150);
    });

    it('throws error for zero FLA', () => {
      expect(() => sizeOCPD(0)).toThrow();
    });
  });

  describe('calculateTurnsRatio', () => {
    it('calculates step-down ratio correctly', () => {
      // 480V to 120V = 4:1 ratio
      expect(calculateTurnsRatio(480, 120)).toBe(4);
    });

    it('calculates step-up ratio correctly', () => {
      // 240V to 480V = 0.5:1 ratio
      expect(calculateTurnsRatio(240, 480)).toBe(0.5);
    });

    it('calculates isolation transformer ratio', () => {
      // 480V to 480V = 1:1 ratio
      expect(calculateTurnsRatio(480, 480)).toBe(1);
    });

    it('throws error for zero secondary voltage', () => {
      expect(() => calculateTurnsRatio(480, 0)).toThrow();
    });
  });

  describe('getTypicalImpedance', () => {
    it('returns typical impedance for 75 KVA', () => {
      expect(getTypicalImpedance(75)).toBe(1.4);
    });

    it('returns typical impedance for 500 KVA', () => {
      expect(getTypicalImpedance(500)).toBe(1.1);
    });

    it('returns closest match for non-standard size', () => {
      // 60 KVA is equidistant from 50 (1.5%) and 75 (1.4%)
      // Implementation returns 1.5 for 60 KVA
      const result = getTypicalImpedance(60);
      expect(result === 1.4 || result === 1.5).toBe(true);
    });

    it('returns default for very small transformers', () => {
      expect(getTypicalImpedance(3)).toBe(2.0);
    });
  });

  describe('calculateTransformerSpecs', () => {
    const validInput: TransformerInput = {
      kva: 75,
      primaryVoltage: 480,
      secondaryVoltage: 208,
      phase: 'three',
      impedancePercent: 1.5,
    };

    it('calculates complete specs for three-phase transformer', () => {
      const result = calculateTransformerSpecs(validInput);

      // Primary FLA: 75000 / (480 * 1.732) = 90.2A
      expect(result.primaryFLA).toBeCloseTo(90.21, 1);

      // Secondary FLA: 75000 / (208 * 1.732) = 208.2A
      expect(result.secondaryFLA).toBeCloseTo(208.2, 1);

      // Primary OCPD: 90.2 * 1.25 = 112.75 → 125A
      expect(result.primaryOCPD).toBe(125);

      // Secondary OCPD: 208.2 * 1.25 = 260.25 → 300A
      expect(result.secondaryOCPD).toBe(300);

      // Fault current: 208.2 / 0.015 = 13,880A (approx)
      expect(result.faultCurrent).toBeCloseTo(13880, -2); // Within 100A

      // Turns ratio: 480 / 208 = 2.31
      expect(result.turnsRatio).toBeCloseTo(2.31, 1);

      // Should have notes
      expect(result.notes.length).toBeGreaterThan(0);
    });

    it('calculates correctly for single-phase transformer', () => {
      const singlePhaseInput: TransformerInput = {
        kva: 50,
        primaryVoltage: 480,
        secondaryVoltage: 240,
        phase: 'single',
        impedancePercent: 1.5,
      };

      const result = calculateTransformerSpecs(singlePhaseInput);

      // Primary FLA: 50000 / 480 = 104.2A
      expect(result.primaryFLA).toBeCloseTo(104.17, 1);

      // Secondary FLA: 50000 / 240 = 208.3A
      expect(result.secondaryFLA).toBeCloseTo(208.33, 1);
    });

    it('identifies step-up transformer in notes', () => {
      const stepUpInput: TransformerInput = {
        kva: 10,
        primaryVoltage: 240,
        secondaryVoltage: 480,
        phase: 'single',
        impedancePercent: 2,
      };

      const result = calculateTransformerSpecs(stepUpInput);
      expect(result.notes.some((note: string) => note.includes('Step-up'))).toBe(true);
    });

    it('identifies isolation transformer in notes', () => {
      const isolationInput: TransformerInput = {
        kva: 10,
        primaryVoltage: 480,
        secondaryVoltage: 480,
        phase: 'three',
        impedancePercent: 2,
      };

      const result = calculateTransformerSpecs(isolationInput);
      expect(result.notes.some((note: string) => note.includes('Isolation'))).toBe(true);
    });

    it('throws error for zero KVA', () => {
      expect(() => calculateTransformerSpecs({ ...validInput, kva: 0 })).toThrow();
    });

    it('throws error for negative impedance', () => {
      expect(() => calculateTransformerSpecs({ ...validInput, impedancePercent: -1 })).toThrow();
    });

    it('throws error for impedance > 20%', () => {
      expect(() => calculateTransformerSpecs({ ...validInput, impedancePercent: 25 })).toThrow();
    });
  });

  describe('calculateMinimumTransformerSize', () => {
    it('calculates minimum size with default 125% factor', () => {
      // 100A at 240V single-phase = 24 KVA * 1.25 = 30 KVA
      const result = calculateMinimumTransformerSize(100, 240, 'single');
      expect(result).toBe(30);
    });

    it('calculates with custom diversity factor', () => {
      // 100A at 480V three-phase = 83.14 KVA * 1.5 = 124.7 KVA
      const result = calculateMinimumTransformerSize(100, 480, 'three', 1.5);
      expect(result).toBeCloseTo(124.7, 1);
    });

    it('throws error for zero load amps', () => {
      expect(() => calculateMinimumTransformerSize(0, 240, 'single')).toThrow();
    });
  });

  describe('formatAmps', () => {
    it('formats amps with 2 decimal places', () => {
      expect(formatAmps(125.5)).toBe('125.50 A');
    });

    it('formats whole number amps', () => {
      expect(formatAmps(100)).toBe('100.00 A');
    });
  });

  describe('formatKVA', () => {
    it('formats KVA correctly', () => {
      expect(formatKVA(75)).toBe('75 KVA');
    });
  });
});
