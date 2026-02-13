import { calculateDeratedAmpacity } from '../../services/ampacityService';
import { AmpacityInput } from '../../types/ampacity';

describe('Wire Ampacity Edge Cases', () => {
  describe('Extreme Conditions', () => {
    it('should handle worst case: 50°C + 41+ conductors + continuous', () => {
      const input: AmpacityInput = {
        wireSize: '12',
        insulationType: 'THHN/THWN-2',
        ambientTempC: 50,
        conductorCountRange: '41+',
        continuousLoad: true,
      };
      const result = calculateDeratedAmpacity(input);
      
      expect(result.baseAmpacity).toBe(30);
      expect(result.temperatureCorrectionFactor).toBeLessThan(0.9); // High temp penalty
      expect(result.adjustmentFactor).toBeLessThan(0.5); // Heavy loading penalty
      expect(result.continuousFactor).toBe(0.8); // Continuous load
      expect(result.deratedAmpacity).toBeLessThan(10); // Severe derating
      expect(result.warnings.length).toBeGreaterThan(0); // Should warn
    });

    it('should handle ideal conditions: 30°C + 1-3 conductors + no continuous', () => {
      const input: AmpacityInput = {
        wireSize: '12',
        insulationType: 'THHN/THWN-2',
        ambientTempC: 30,
        conductorCountRange: '1-3',
        continuousLoad: false,
      };
      const result = calculateDeratedAmpacity(input);
      
      expect(result.baseAmpacity).toBe(30);
      expect(result.temperatureCorrectionFactor).toBe(1.0); // No temp correction at 30°C
      expect(result.adjustmentFactor).toBe(1.0); // No adjustment for 1-3
      expect(result.continuousFactor).toBe(1.0); // No continuous load
      expect(result.deratedAmpacity).toBe(30); // No derating
      expect(result.warnings.length).toBe(0); // No warnings
    });

    it('should handle large conductor (500 kcmil) at high temp', () => {
      const input: AmpacityInput = {
        wireSize: '500',
        insulationType: 'XHHW-2',
        ambientTempC: 45,
        conductorCountRange: '4-6',
        continuousLoad: false,
      };
      const result = calculateDeratedAmpacity(input);
      
      expect(result.baseAmpacity).toBeGreaterThan(400);
      expect(result.deratedAmpacity).toBeGreaterThanOrEqual(290); // Still substantial after derating
      expect(result.warnings.length).toBeGreaterThan(0); // Should warn about high temp
    });

    it('should warn on small wire extreme conditions', () => {
      const input: AmpacityInput = {
        wireSize: '14',
        insulationType: 'THHN/THWN',
        ambientTempC: 50,
        conductorCountRange: '31-40',
        continuousLoad: true,
      };
      const result = calculateDeratedAmpacity(input);
      
      expect(result.deratedAmpacity).toBeLessThan(5); // Very low final ampacity
      expect(result.warnings).toContain('⚠️ Very low ampacity. Consider larger wire size.');
      expect(result.warnings).toContain('⚠️ High ambient temperature. Verify installation conditions.');
      expect(result.warnings).toContain('⚠️ Heavy conduit loading. Consider splitting circuits.');
    });
  });

  describe('Insulation Type Comparison', () => {
    it('should show different base ampacities for different insulation types', () => {
      const baseInput = {
        wireSize: '10' as const,
        ambientTempC: 35,
        conductorCountRange: '7-9' as const,
        continuousLoad: true,
      };

      const thhn = calculateDeratedAmpacity({ ...baseInput, insulationType: 'THHN/THWN' });
      const thhn2 = calculateDeratedAmpacity({ ...baseInput, insulationType: 'THHN/THWN-2' });
      const xhhw2 = calculateDeratedAmpacity({ ...baseInput, insulationType: 'XHHW-2' });
      const rhw2 = calculateDeratedAmpacity({ ...baseInput, insulationType: 'RHW-2' });

      // THHN has lower rating than THHN-2/XHHW-2/RHW-2
      expect(thhn.baseAmpacity).toBeLessThan(thhn2.baseAmpacity);
      expect(thhn2.baseAmpacity).toBe(xhhw2.baseAmpacity);
      expect(thhn2.baseAmpacity).toBe(rhw2.baseAmpacity);
    });
  });

  describe('Temperature Extremes', () => {
    it('should apply progressively harsher derating at higher temps', () => {
      const temps = [30, 35, 40, 45, 50];
      const results = temps.map(temp =>
        calculateDeratedAmpacity({
          wireSize: '10',
          insulationType: 'THHN/THWN-2',
          ambientTempC: temp,
          conductorCountRange: '1-3',
          continuousLoad: false,
        })
      );

      // Each temp increase should reduce final ampacity
      for (let i = 1; i < results.length; i++) {
        expect(results[i].deratedAmpacity).toBeLessThan(results[i - 1].deratedAmpacity);
      }
    });
  });

  describe('Conductor Count Ranges', () => {
    it('should apply progressively harsher derating with more conductors', () => {
      const ranges: Array<'1-3' | '4-6' | '7-9' | '10-20' | '21-30' | '31-40' | '41+'> = [
        '1-3', '4-6', '7-9', '10-20', '21-30', '31-40', '41+'
      ];
      const results = ranges.map(range =>
        calculateDeratedAmpacity({
          wireSize: '10',
          insulationType: 'THHN/THWN-2',
          ambientTempC: 30,
          conductorCountRange: range,
          continuousLoad: false,
        })
      );

      // Each increase in conductor count should reduce final ampacity
      for (let i = 1; i < results.length; i++) {
        expect(results[i].deratedAmpacity).toBeLessThanOrEqual(results[i - 1].deratedAmpacity);
      }
    });
  });

  describe('Continuous Load Impact', () => {
    it('should apply 80% factor for continuous loads', () => {
      const nonContinuous = calculateDeratedAmpacity({
        wireSize: '10',
        insulationType: 'THHN/THWN-2',
        ambientTempC: 30,
        conductorCountRange: '1-3',
        continuousLoad: false,
      });

      const continuous = calculateDeratedAmpacity({
        wireSize: '10',
        insulationType: 'THHN/THWN-2',
        ambientTempC: 30,
        conductorCountRange: '1-3',
        continuousLoad: true,
      });

      expect(continuous.continuousFactor).toBe(0.8);
      expect(continuous.deratedAmpacity).toBe(Math.floor(nonContinuous.deratedAmpacity * 0.8));
    });
  });
});
