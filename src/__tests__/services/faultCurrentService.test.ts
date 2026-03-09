/**
 * Fault Current Service Tests
 * 
 * Validates fault current calculations against known values and edge cases.
 */

import {
  calculateFaultCurrent,
  calculateTransformerFLA,
  calculateTransformerFaultCurrent,
  getConductorImpedance,
  calculateMotorContribution,
  determineSCCR,
  formatFaultCurrent,
  getTypicalImpedance,
} from '../../services/faultCurrentService';
import { Phase, ConductorMaterial } from '../../types/faultCurrent';

describe('Fault Current Calculations', () => {
  describe('Transformer FLA Calculations', () => {
    test('calculates 3-phase transformer FLA correctly', () => {
      // 75kVA, 480V 3-phase
      const fla = calculateTransformerFLA(75, 480, 'three');
      expect(fla).toBeCloseTo(90.2, 1);
    });

    test('calculates single-phase transformer FLA correctly', () => {
      // 25kVA, 240V single-phase
      const fla = calculateTransformerFLA(25, 240, 'single');
      expect(fla).toBeCloseTo(104.2, 1);
    });

    test('calculates 208V 3-phase transformer FLA', () => {
      // 150kVA, 208V 3-phase
      const fla = calculateTransformerFLA(150, 208, 'three');
      expect(fla).toBeCloseTo(416.4, 1);
    });

    test('calculates 277V transformer FLA', () => {
      // 75kVA, 277V single-phase
      const fla = calculateTransformerFLA(75, 277, 'single');
      expect(fla).toBeCloseTo(270.8, 1);
    });
  });

  describe('Transformer Fault Current', () => {
    test('calculates fault current at 2% impedance', () => {
      // 90A FLA, 2% Z = 4500A fault current
      const faultCurrent = calculateTransformerFaultCurrent(90.2, 2.0);
      expect(faultCurrent).toBeCloseTo(4510, 0);
    });

    test('calculates fault current at 3% impedance', () => {
      // 416A FLA, 3% Z
      const faultCurrent = calculateTransformerFaultCurrent(416.4, 3.0);
      expect(faultCurrent).toBeCloseTo(13880, 0);
    });

    test('calculates fault current at 5% impedance', () => {
      // 1000kVA, 480V = 1203A FLA, 5% Z
      const fla = calculateTransformerFLA(1000, 480, 'three');
      const faultCurrent = calculateTransformerFaultCurrent(fla, 5.0);
      expect(faultCurrent).toBeCloseTo(24056, 0);
    });

    test('throws error for zero impedance', () => {
      expect(() => calculateTransformerFaultCurrent(100, 0)).toThrow();
    });
  });

  describe('Conductor Impedance', () => {
    test('returns copper #4 impedance', () => {
      const impedance = getConductorImpedance('4', 'copper');
      expect(impedance).toBeDefined();
      expect(impedance?.r).toBeCloseTo(0.308, 3);
      expect(impedance?.x).toBeCloseTo(0.048, 3);
    });

    test('returns aluminum 3/0 impedance', () => {
      const impedance = getConductorImpedance('3/0', 'aluminum');
      expect(impedance).toBeDefined();
      expect(impedance?.r).toBeCloseTo(0.127, 3);
    });

    test('returns copper 250 kcmil impedance', () => {
      const impedance = getConductorImpedance('250', 'copper');
      expect(impedance).toBeDefined();
      expect(impedance?.r).toBeCloseTo(0.0515, 4);
    });

    test('returns null for invalid size', () => {
      const impedance = getConductorImpedance('999', 'copper');
      expect(impedance).toBeNull();
    });
  });

  describe('Motor Contribution', () => {
    test('calculates motor contribution at 480V', () => {
      // 50 HP at 480V
      const contribution = calculateMotorContribution(50, 480);
      expect(contribution).toBeGreaterThan(0);
      expect(contribution).toBeCloseTo(100, 0); // ~100A
    });

    test('scales with voltage', () => {
      const at480V = calculateMotorContribution(50, 480);
      const at240V = calculateMotorContribution(50, 240);
      expect(at240V).toBeGreaterThan(at480V);
    });

    test('returns 0 for zero HP', () => {
      const contribution = calculateMotorContribution(0, 480);
      expect(contribution).toBe(0);
    });
  });

  describe('SCCR Determination', () => {
    test('returns 10kA for low fault current', () => {
      const sccr = determineSCCR(5000);
      expect(sccr).toBe('10kA');
    });

    test('returns 22kA for medium fault current', () => {
      const sccr = determineSCCR(15000);
      expect(sccr).toBe('22kA');
    });

    test('returns 65kA for high fault current', () => {
      const sccr = determineSCCR(45000);
      expect(sccr).toBe('65kA');
    });

    test('returns 100kA for very high fault current', () => {
      const sccr = determineSCCR(70000);
      expect(sccr).toBe('100kA');
    });

    test('includes safety margin in calculation', () => {
      // 18kA with 25% margin = 22.5kA, should select 42kA (22kA is too close to margin)
      const sccr = determineSCCR(18000);
      expect(sccr).toBe('42kA');
    });
  });

  describe('Format Fault Current', () => {
    test('formats amps as kA when >= 1000', () => {
      expect(formatFaultCurrent(15000)).toBe('15.0kA');
      expect(formatFaultCurrent(22500)).toBe('22.5kA');
    });

    test('formats amps as A when < 1000', () => {
      expect(formatFaultCurrent(500)).toBe('500A');
      expect(formatFaultCurrent(999)).toBe('999A');
    });

    test('handles edge case at 1000', () => {
      expect(formatFaultCurrent(1000)).toBe('1.0kA');
    });
  });

  describe('Typical Impedance', () => {
    test('returns 2% for small transformers', () => {
      expect(getTypicalImpedance(75)).toBe(2.0);
      expect(getTypicalImpedance(150)).toBe(2.0);
    });

    test('returns 3% for medium transformers', () => {
      expect(getTypicalImpedance(300)).toBe(3.0);
      expect(getTypicalImpedance(500)).toBe(3.0);
    });

    test('returns 4% for large transformers', () => {
      expect(getTypicalImpedance(750)).toBe(4.0);
      expect(getTypicalImpedance(1000)).toBe(4.0);
    });

    test('returns 5% for very large transformers', () => {
      expect(getTypicalImpedance(1500)).toBe(5.0);
      expect(getTypicalImpedance(2500)).toBe(5.0);
    });
  });

  describe('Full Integration Tests', () => {
    test('75kVA 480V 3-phase with 2% Z', () => {
      const result = calculateFaultCurrent({
        kva: 75,
        primaryVoltage: 12470,
        secondaryVoltage: 480,
        impedancePercent: 2.0,
        phase: 'three',
      });

      expect(result.transformerFLA).toBeCloseTo(90.2, 1);
      expect(result.transformerFaultCurrent).toBeCloseTo(4510, -2);
      expect(result.totalFaultCurrent).toBeGreaterThan(4000);
      expect(result.sccrRequired).toBe('10kA');
    });

    test('225kVA 208V 3-phase with 3% Z', () => {
      const result = calculateFaultCurrent({
        kva: 225,
        primaryVoltage: 480,
        secondaryVoltage: 208,
        impedancePercent: 3.0,
        phase: 'three',
      });

      expect(result.transformerFLA).toBeCloseTo(624.5, 1);
      expect(result.totalFaultCurrent).toBeGreaterThan(20000);
      expect(result.sccrRequired).toBe('42kA'); // With safety margin
    });

    test('500kVA 480V 3-phase with 3% Z and motor contribution', () => {
      const result = calculateFaultCurrent({
        kva: 500,
        primaryVoltage: 12470,
        secondaryVoltage: 480,
        impedancePercent: 3.0,
        phase: 'three',
        includeMotorContribution: true,
        motorHp: 100,
      });

      expect(result.transformerFLA).toBeCloseTo(601.4, 1);
      expect(result.motorContribution).toBeGreaterThan(0);
      expect(result.totalFaultCurrent).toBeGreaterThan(result.transformerFaultCurrent);
    });

    test('with conductor impedance (long run)', () => {
      const result = calculateFaultCurrent({
        kva: 150,
        primaryVoltage: 480,
        secondaryVoltage: 208,
        impedancePercent: 3.0,
        phase: 'three',
        conductorLength: 500,
        conductorSize: '2/0',
        conductorType: 'copper',
      });

      expect(result.conductorImpedance).toBeDefined();
      expect(result.faultCurrentAtPoint).toBeLessThan(result.transformerFaultCurrent);
    });

    test('single-phase transformer calculation', () => {
      const result = calculateFaultCurrent({
        kva: 50,
        primaryVoltage: 2400,
        secondaryVoltage: 240,
        impedancePercent: 2.5,
        phase: 'single',
      });

      expect(result.transformerFLA).toBeCloseTo(208.3, 1);
      expect(result.totalFaultCurrent).toBeGreaterThan(8000);
    });
  });

  describe('Error Handling', () => {
    test('throws error for zero kVA', () => {
      expect(() =>
        calculateFaultCurrent({
          kva: 0,
          primaryVoltage: 480,
          secondaryVoltage: 240,
          impedancePercent: 2.0,
          phase: 'three',
        })
      ).toThrow('Transformer kVA must be greater than 0');
    });

    test('throws error for zero secondary voltage', () => {
      expect(() =>
        calculateFaultCurrent({
          kva: 75,
          primaryVoltage: 480,
          secondaryVoltage: 0,
          impedancePercent: 2.0,
          phase: 'three',
        })
      ).toThrow('Secondary voltage must be greater than 0');
    });

    test('throws error for zero impedance', () => {
      expect(() =>
        calculateFaultCurrent({
          kva: 75,
          primaryVoltage: 480,
          secondaryVoltage: 240,
          impedancePercent: 0,
          phase: 'three',
        })
      ).toThrow('Transformer impedance must be greater than 0%');
    });
  });

  describe('Edge Cases', () => {
    test('handles very large transformer', () => {
      const result = calculateFaultCurrent({
        kva: 2500,
        primaryVoltage: 12470,
        secondaryVoltage: 480,
        impedancePercent: 5.0,
        phase: 'three',
      });

      expect(result.totalFaultCurrent).toBeGreaterThan(60000);
      expect(result.sccrRequired).toBe('100kA');
    });

    test('handles small transformer', () => {
      const result = calculateFaultCurrent({
        kva: 15,
        primaryVoltage: 480,
        secondaryVoltage: 208,
        impedancePercent: 2.0,
        phase: 'three',
      });

      expect(result.totalFaultCurrent).toBeLessThan(2500);
      expect(result.sccrRequired).toBe('10kA');
    });

    test('handles conductor length of 0', () => {
      const result = calculateFaultCurrent({
        kva: 75,
        primaryVoltage: 480,
        secondaryVoltage: 240,
        impedancePercent: 2.0,
        phase: 'three',
        conductorLength: 0,
      });

      expect(result.faultCurrentAtPoint).toBe(result.transformerFaultCurrent);
    });
  });
});
