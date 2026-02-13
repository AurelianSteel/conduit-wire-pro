// src/__tests__/services/ampacityService.test.ts

import { calculateDeratedAmpacity } from '../../services/ampacityService';
import { AmpacityInput } from '../../types/ampacity';

describe('ampacityService', () => {
  describe('calculateDeratedAmpacity', () => {
    // Test 1: Baseline - No Derating
    it('should return base ampacity with no derating factors', () => {
      const input: AmpacityInput = {
        wireSize: '12',
        insulationType: 'THHN/THWN-2',
        ambientTempC: 30,
        conductorCountRange: '1-3',
        continuousLoad: false
      };
      
      const result = calculateDeratedAmpacity(input);
      
      expect(result.baseAmpacity).toBe(30);
      expect(result.temperatureCorrectionFactor).toBe(1.0);
      expect(result.adjustmentFactor).toBe(1.0);
      expect(result.continuousFactor).toBe(1.0);
      expect(result.deratedAmpacity).toBe(30);
      expect(result.necArticle).toBe('310.15');
      expect(result.warnings).toHaveLength(0);
    });

    // Test 2: Temperature Derating Only
    it('should apply temperature correction factor at 45°C', () => {
      const input: AmpacityInput = {
        wireSize: '12',
        insulationType: 'THHN/THWN-2',
        ambientTempC: 45,
        conductorCountRange: '1-3',
        continuousLoad: false
      };
      
      const result = calculateDeratedAmpacity(input);
      
      expect(result.baseAmpacity).toBe(30);
      expect(result.temperatureCorrectionFactor).toBeCloseTo(0.87, 2);
      expect(result.adjustmentFactor).toBe(1.0);
      expect(result.continuousFactor).toBe(1.0);
      expect(result.deratedAmpacity).toBeLessThan(30);
      expect(result.warnings).toContain('⚠️ High ambient temperature. Verify installation conditions.');
    });

    // Test 3: Conductor Count Adjustment Only
    it('should apply adjustment factor for 7-9 conductors', () => {
      const input: AmpacityInput = {
        wireSize: '12',
        insulationType: 'THHN/THWN-2',
        ambientTempC: 30,
        conductorCountRange: '7-9',
        continuousLoad: false
      };
      
      const result = calculateDeratedAmpacity(input);
      
      expect(result.baseAmpacity).toBe(30);
      expect(result.temperatureCorrectionFactor).toBe(1.0);
      expect(result.adjustmentFactor).toBe(0.70);
      expect(result.continuousFactor).toBe(1.0);
      expect(result.deratedAmpacity).toBe(21); // 30 * 0.70 = 21
    });

    // Test 4: Continuous Load Only
    it('should apply 80% continuous load factor', () => {
      const input: AmpacityInput = {
        wireSize: '12',
        insulationType: 'THHN/THWN-2',
        ambientTempC: 30,
        conductorCountRange: '1-3',
        continuousLoad: true
      };
      
      const result = calculateDeratedAmpacity(input);
      
      expect(result.baseAmpacity).toBe(30);
      expect(result.temperatureCorrectionFactor).toBe(1.0);
      expect(result.adjustmentFactor).toBe(1.0);
      expect(result.continuousFactor).toBe(0.8);
      expect(result.deratedAmpacity).toBe(24); // 30 * 0.8 = 24
    });

    // Test 5: Full Derating (All Factors)
    it('should apply all derating factors correctly', () => {
      const input: AmpacityInput = {
        wireSize: '12',
        insulationType: 'THHN/THWN-2',
        ambientTempC: 45,
        conductorCountRange: '10-20',
        continuousLoad: true
      };
      
      const result = calculateDeratedAmpacity(input);
      
      expect(result.baseAmpacity).toBe(30);
      expect(result.temperatureCorrectionFactor).toBeCloseTo(0.87, 2);
      expect(result.adjustmentFactor).toBe(0.50);
      expect(result.continuousFactor).toBe(0.8);
      // 30 * 0.87 * 0.50 * 0.8 ≈ 10.44 → floor = 10
      expect(result.deratedAmpacity).toBeLessThanOrEqual(11);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    // Test 6: Large Conductor
    it('should handle large conductors correctly', () => {
      const input: AmpacityInput = {
        wireSize: '4/0',
        insulationType: 'XHHW-2',
        ambientTempC: 30,
        conductorCountRange: '4-6',
        continuousLoad: false
      };
      
      const result = calculateDeratedAmpacity(input);
      
      expect(result.baseAmpacity).toBe(260); // From wire-ampacity-data
      expect(result.temperatureCorrectionFactor).toBe(1.0);
      expect(result.adjustmentFactor).toBe(0.80);
      expect(result.continuousFactor).toBe(1.0);
      expect(result.deratedAmpacity).toBe(208); // 260 * 0.8 = 208
    });

    // Test 7: Edge Case - Very Low Result
    it('should warn on very low ampacity result', () => {
      const input: AmpacityInput = {
        wireSize: '14',
        insulationType: 'THHN/THWN',
        ambientTempC: 50,
        conductorCountRange: '21-30',
        continuousLoad: true
      };
      
      const result = calculateDeratedAmpacity(input);
      
      expect(result.deratedAmpacity).toBeLessThan(15);
      expect(result.warnings).toContain('⚠️ Very low ampacity. Consider larger wire size.');
    });
  });
});

