import { applyDwellingDemandFactor, calculateServiceFeeder } from '../../services/serviceFeederService';

describe('serviceFeederService', () => {
  describe('applyDwellingDemandFactor', () => {
    it('applies 100% up to first 10kVA and 40% remainder', () => {
      expect(applyDwellingDemandFactor(10000)).toBe(10000);
      expect(applyDwellingDemandFactor(25000)).toBe(16000); // 10000 + (15000 * 0.4)
    });
  });

  describe('calculateServiceFeeder', () => {
    it('calculates default dwelling loads with range/dryer defaults', () => {
      const result = calculateServiceFeeder({
        squareFootage: 2000,
        fastenedAppliancesVa: [1200, 1000, 4500],
        heatingVa: 8000,
        coolingVa: 6000,
      });

      // Connected load = 6000 + 3000 + 1500 + 6700 + 8000 + 5000 + 8000 = 38200 VA
      expect(result.breakdown.connectedLoadVa).toBe(38200);
      // Demand adjusted = 10000 + (28200 * 0.4) = 21280 VA
      expect(result.breakdown.demandAdjustedVa).toBe(21280);
      // 21280 / 240 = 88.67 => rounded 89A
      expect(result.calculatedAmps).toBe(89);
      expect(result.recommendedService).toBe(100);
      expect(result.breakdown.hvacLargestVa).toBe(8000);
    });

    it('uses larger of heating or cooling only', () => {
      const result = calculateServiceFeeder({
        squareFootage: 1500,
        includeRange: false,
        includeDryer: false,
        heatingVa: 4000,
        coolingVa: 9000,
      });

      expect(result.breakdown.hvacLargestVa).toBe(9000);
    });

    it('recommends 200A when load is above 100A and at/below 200A', () => {
      const result = calculateServiceFeeder({
        squareFootage: 6000,
        fastenedAppliancesVa: [6000, 7000, 5000],
        heatingVa: 24000,
      });

      expect(result.calculatedAmps).toBeGreaterThan(100);
      expect(result.calculatedAmps).toBeLessThanOrEqual(200);
      expect(result.recommendedService).toBe(200);
    });

    it('recommends 400A when load exceeds 200A', () => {
      const result = calculateServiceFeeder({
        squareFootage: 15000,
        fastenedAppliancesVa: [12000, 10000, 8000],
        heatingVa: 60000,
      });

      expect(result.calculatedAmps).toBeGreaterThan(200);
      expect(result.recommendedService).toBe(400);
    });

    it('flags warning when load exceeds 80% of recommended service', () => {
      const result = calculateServiceFeeder({
        squareFootage: 9000,
        fastenedAppliancesVa: [12000, 8000, 6000],
        heatingVa: 30000,
      });

      expect(result.exceeds80PercentRule).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('throws on invalid square footage', () => {
      expect(() => calculateServiceFeeder({ squareFootage: 0 })).toThrow('Square footage must be greater than 0.');
    });
  });
});
