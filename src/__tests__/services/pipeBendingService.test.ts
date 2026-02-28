/**
 * Pipe Bending Service Tests
 * Tests offset, saddle, 90-degree, and rolling offset calculations
 */

import {
  calculateOffset,
  calculateSaddle,
  calculateNinety,
  calculateRollingOffset,
  formatMeasurement,
  recommendAngle,
  getOffsetQuickReference,
} from '../../services/pipeBendingService';
import { BendAngle, ConduitSize } from '../../types/pipeBending';

describe('pipeBendingService', () => {
  describe('formatMeasurement', () => {
    it('formats whole inches', () => {
      expect(formatMeasurement(5)).toBe('5"');
      expect(formatMeasurement(12)).toBe('12"');
    });

    it('formats fractions', () => {
      expect(formatMeasurement(0.5)).toBe('1/2"');
      expect(formatMeasurement(0.25)).toBe('1/4"');
      expect(formatMeasurement(0.75)).toBe('3/4"');
    });

    it('formats mixed numbers', () => {
      expect(formatMeasurement(5.5)).toBe('5-1/2"');
      expect(formatMeasurement(5.25)).toBe('5-1/4"');
      expect(formatMeasurement(5.75)).toBe('5-3/4"');
    });

    it('formats sixteenths', () => {
      expect(formatMeasurement(5.0625)).toBe('5-1/16"');
      expect(formatMeasurement(5.9375)).toBe('5-15/16"');
    });
  });

  describe('calculateOffset', () => {
    it('calculates 30-degree offset correctly', () => {
      const result = calculateOffset({
        obstructionHeight: 6,
        angle: 30,
        conduitSize: '3/4',
      });

      expect(result.obstructionHeight).toBe(6);
      expect(result.angle).toBe(30);
      expect(result.multiplier).toBe(2.0);
      expect(result.distanceBetweenBends).toBe(12); // 6 × 2.0
    });

    it('calculates 45-degree offset correctly', () => {
      const result = calculateOffset({
        obstructionHeight: 6,
        angle: 45,
        conduitSize: '3/4',
      });

      expect(result.multiplier).toBe(1.414);
      expect(result.distanceBetweenBends).toBeCloseTo(8.5, 0.5); // 6 × 1.414 ≈ 8.5
    });

    it('calculates 22.5-degree offset correctly', () => {
      const result = calculateOffset({
        obstructionHeight: 6,
        angle: 22.5,
        conduitSize: '3/4',
      });

      expect(result.multiplier).toBe(2.61);
      expect(result.distanceBetweenBends).toBeCloseTo(15.66, 0.5);
    });

    it('calculates bend marks with advance distance', () => {
      const result = calculateOffset({
        obstructionHeight: 6,
        angle: 30,
        conduitSize: '3/4',
        advanceDistance: 24,
      });

      expect(result.bendMarks.firstBend).toBe(24);
      expect(result.bendMarks.secondBend).toBe(36); // 24 + 12
    });

    it('includes shrinkage calculation', () => {
      const result = calculateOffset({
        obstructionHeight: 6,
        angle: 30,
        conduitSize: '3/4',
      });

      expect(result.shrinkage).toBeGreaterThan(0); // 6 × 0.25 = 1.5
      expect(result.shrinkage).toBeCloseTo(1.5, 0.1);
    });

    it('includes gain calculation', () => {
      const result = calculateOffset({
        obstructionHeight: 6,
        angle: 30,
        conduitSize: '3/4',
      });

      expect(result.gain).toBe(0.25); // 30° gain
    });

    it('throws error for negative obstruction height', () => {
      expect(() => calculateOffset({
        obstructionHeight: -5,
        angle: 30,
        conduitSize: '3/4',
      })).toThrow();
    });

    it('throws error for zero obstruction height', () => {
      expect(() => calculateOffset({
        obstructionHeight: 0,
        angle: 30,
        conduitSize: '3/4',
      })).toThrow();
    });

    it('adds warning for shallow angle with large offset', () => {
      const result = calculateOffset({
        obstructionHeight: 18,
        angle: 10,
        conduitSize: '3/4',
      });

      expect(result.notes.some((note: string) => note.includes('significant bend spacing'))).toBe(true);
    });

    it('adds tip for 30-degree offset', () => {
      const result = calculateOffset({
        obstructionHeight: 6,
        angle: 30,
        conduitSize: '3/4',
      });

      expect(result.notes.some((note: string) => note.includes('most common'))).toBe(true);
    });
  });

  describe('calculateSaddle', () => {
    it('calculates 3-point saddle correctly', () => {
      const result = calculateSaddle({
        obstructionWidth: 6,
        angle: 30,
        conduitSize: '3/4',
        saddleType: '3pt',
      });

      expect(result.saddleType).toBe('3pt');
      expect(result.marks).toHaveLength(3);
      expect(result.centerPoint).toBe(0);
    });

    it('calculates 3-point saddle with offset center', () => {
      const result = calculateSaddle({
        obstructionWidth: 6,
        angle: 30,
        conduitSize: '3/4',
        saddleType: '3pt',
        offsetCenter: 30,
      });

      expect(result.centerPoint).toBe(30);
      expect(result.marks[1]).toBe(30); // Center mark at offset
    });

    it('calculates 4-point saddle correctly', () => {
      const result = calculateSaddle({
        obstructionWidth: 12,
        angle: 30,
        conduitSize: '1',
        saddleType: '4pt',
      });

      expect(result.saddleType).toBe('4pt');
      expect(result.marks).toHaveLength(4);
    });

    it('includes shrinkage for saddle', () => {
      const result = calculateSaddle({
        obstructionWidth: 6,
        angle: 30,
        conduitSize: '3/4',
        saddleType: '3pt',
      });

      expect(result.shrinkage).toBeGreaterThan(0);
    });

    it('includes instruction notes for 3-point', () => {
      const result = calculateSaddle({
        obstructionWidth: 6,
        angle: 30,
        conduitSize: '3/4',
        saddleType: '3pt',
      });

      expect(result.notes.some((note: string) => note.includes('opposite direction'))).toBe(true);
    });

    it('includes instruction notes for 4-point', () => {
      const result = calculateSaddle({
        obstructionWidth: 12,
        angle: 30,
        conduitSize: '1',
        saddleType: '4pt',
      });

      expect(result.notes.some((note: string) => note.includes('Inner bends'))).toBe(true);
    });

    it('throws error for negative obstruction width', () => {
      expect(() => calculateSaddle({
        obstructionWidth: -6,
        angle: 30,
        conduitSize: '3/4',
        saddleType: '3pt',
      })).toThrow();
    });
  });

  describe('calculateNinety', () => {
    it('calculates 90-degree bend for 1/2" conduit', () => {
      const result = calculateNinety({
        conduitSize: '1/2',
        legLength: 24,
      });

      expect(result.conduitSize).toBe('1/2');
      expect(result.takeUp).toBe(5);
      expect(result.cutLength).toBe(29); // 24 + 5
      expect(result.bendMark).toBe(5);
    });

    it('calculates 90-degree bend for 3/4" conduit', () => {
      const result = calculateNinety({
        conduitSize: '3/4',
        legLength: 36,
      });

      expect(result.takeUp).toBe(6);
      expect(result.cutLength).toBe(42); // 36 + 6
    });

    it('calculates 90-degree bend for 1" conduit', () => {
      const result = calculateNinety({
        conduitSize: '1',
        legLength: 48,
      });

      expect(result.takeUp).toBe(8);
      expect(result.cutLength).toBe(56);
    });

    it('includes instructions in notes', () => {
      const result = calculateNinety({
        conduitSize: '3/4',
        legLength: 36,
      });

      expect(result.notes.some((note: string) => note.includes('Measure'))).toBe(true);
      expect(result.notes.some((note: string) => note.includes('arrow'))).toBe(true);
    });

    it('adds warning for large conduit', () => {
      const result = calculateNinety({
        conduitSize: '2',
        legLength: 48,
      });

      expect(result.notes.some((note: string) => note.includes('hydraulic'))).toBe(true);
    });

    it('throws error for negative leg length', () => {
      expect(() => calculateNinety({
        conduitSize: '3/4',
        legLength: -10,
      })).toThrow();
    });
  });

  describe('calculateRollingOffset', () => {
    it('calculates rolling offset correctly', () => {
      const result = calculateRollingOffset({
        verticalOffset: 6,
        horizontalOffset: 8,
        angle: 30,
        conduitSize: '3/4',
      });

      expect(result.verticalOffset).toBe(6);
      expect(result.horizontalOffset).toBe(8);
      // True offset = √(6² + 8²) = √(36 + 64) = √100 = 10
      expect(result.rollingOffset).toBe(10);
    });

    it('calculates rolling offset with 3-4-5 triangle', () => {
      const result = calculateRollingOffset({
        verticalOffset: 3,
        horizontalOffset: 4,
        angle: 45,
        conduitSize: '3/4',
      });

      expect(result.rollingOffset).toBe(5); // √(3² + 4²) = 5
    });

    it('uses correct multiplier for angle', () => {
      const result30 = calculateRollingOffset({
        verticalOffset: 6,
        horizontalOffset: 8,
        angle: 30,
        conduitSize: '3/4',
      });

      const result45 = calculateRollingOffset({
        verticalOffset: 6,
        horizontalOffset: 8,
        angle: 45,
        conduitSize: '3/4',
      });

      expect(result30.multiplier).toBe(2.0);
      expect(result45.multiplier).toBe(1.414);
    });

    it('includes travel length', () => {
      const result = calculateRollingOffset({
        verticalOffset: 6,
        horizontalOffset: 8,
        angle: 30,
        conduitSize: '3/4',
      });

      expect(result.travelLength).toBeGreaterThan(0);
      expect(result.distanceBetweenBends).toBe(result.travelLength);
    });

    it('includes instructions in notes', () => {
      const result = calculateRollingOffset({
        verticalOffset: 6,
        horizontalOffset: 8,
        angle: 30,
        conduitSize: '3/4',
      });

      expect(result.notes.some((note: string) => note.includes('perpendicular'))).toBe(true);
      expect(result.notes.some((note: string) => note.includes('parallel'))).toBe(true);
    });

    it('throws error for negative offsets', () => {
      expect(() => calculateRollingOffset({
        verticalOffset: -5,
        horizontalOffset: 8,
        angle: 30,
        conduitSize: '3/4',
      })).toThrow();

      expect(() => calculateRollingOffset({
        verticalOffset: 6,
        horizontalOffset: -8,
        angle: 30,
        conduitSize: '3/4',
      })).toThrow();
    });
  });

  describe('recommendAngle', () => {
    it('recommends 30° for plenty of space', () => {
      expect(recommendAngle(6, 36)).toBe(30); // 36/6 = 6 ratio
    });

    it('recommends 22.5° for moderate space', () => {
      expect(recommendAngle(6, 20)).toBe(22.5); // 20/6 ≈ 3.3 ratio
    });

    it('recommends 45° for tight space', () => {
      expect(recommendAngle(6, 10)).toBe(45); // 10/6 ≈ 1.67 ratio
    });

    it('recommends 60° for very tight space', () => {
      expect(recommendAngle(6, 8)).toBe(60); // 8/6 ≈ 1.33 ratio
    });
  });

  describe('getOffsetQuickReference', () => {
    it('returns quick reference for 30°', () => {
      const ref = getOffsetQuickReference(30);

      expect(ref).toContainEqual({ offset: 6, spacing: '12"' });
      expect(ref).toContainEqual({ offset: 12, spacing: '24"' });
    });

    it('returns quick reference for 45°', () => {
      const ref = getOffsetQuickReference(45);

      expect(ref).toContainEqual({ offset: 6, spacing: expect.stringContaining('"') });
    });

    it('includes all common offsets', () => {
      const ref = getOffsetQuickReference(30);

      expect(ref).toHaveLength(9);
      expect(ref.map((r: {offset: number}) => r.offset)).toEqual([1, 2, 3, 4, 6, 8, 12, 18, 24]);
    });
  });
});
