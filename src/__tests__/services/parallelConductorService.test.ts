import { calculateParallelConductors, recommendParallelRuns } from '../../services/parallelConductorService';
import { ParallelConductorInput } from '../../services/parallelConductorService';

describe('parallelConductorService', () => {
  describe('calculateParallelConductors', () => {
    it('should calculate for 400A service with 2 runs copper', () => {
      const input: ParallelConductorInput = {
        totalAmpacity: 400,
        numRuns: 2,
        conductorMaterial: 'copper',
        terminalRating: 75,
        includeNeutral: false,
      };
      
      const result = calculateParallelConductors(input);
      
      // 400A / 2 runs = 200A per conductor
      expect(result.ampacityPerConductor).toBe(200);
      // 3/0 AWG Cu @ 75°C = 200A rated
      expect(result.minConductorSize).toBe('3/0');
      expect(result.parallelSets).toBe(2);
      expect(result.totalAmpacityAchieved).toBeGreaterThanOrEqual(400);
      expect(result.necArticle).toBe('310.10(G)');
    });
    
    it('should calculate for 600A with 3 runs aluminum', () => {
      const input: ParallelConductorInput = {
        totalAmpacity: 600,
        numRuns: 3,
        conductorMaterial: 'aluminum',
        terminalRating: 75,
        includeNeutral: false,
      };
      
      const result = calculateParallelConductors(input);
      
      // 600A / 3 runs = 200A per conductor
      expect(result.ampacityPerConductor).toBe(200);
      // 4/0 Al @ 75°C = 180A (too small), 250 kcmil = 205A
      expect(result.totalAmpacityAchieved).toBeGreaterThanOrEqual(600);
    });
    
    it('should upsize for headroom', () => {
      const input: ParallelConductorInput = {
        totalAmpacity: 300,
        numRuns: 2,
        conductorMaterial: 'copper',
        terminalRating: 75,
        includeNeutral: false,
      };
      
      const result = calculateParallelConductors(input);
      
      // 300A / 2 = 150A per conductor minimum
      // With 20% headroom: 150 * 1.2 = 180A → 3/0 AWG (200A)
      // Verify recommended size has adequate ampacity
      expect(result.headroomPercent).toBeGreaterThanOrEqual(0);
    });
    
    it('should include neutral sizing when requested', () => {
      const input: ParallelConductorInput = {
        totalAmpacity: 400,
        numRuns: 2,
        conductorMaterial: 'copper',
        terminalRating: 75,
        includeNeutral: true,
        neutralRatio: 0.5,
      };
      
      const result = calculateParallelConductors(input);
      
      // Neutral at 50%: 400 * 0.5 / 2 = 100A per neutral
      expect(result.neutralSize).toBeDefined();
      expect(result.wireSpecs.neutral).toBeDefined();
    });
    
    it('should throw error for single run', () => {
      const input: ParallelConductorInput = {
        totalAmpacity: 400,
        numRuns: 1, // Invalid - must be 2+
        conductorMaterial: 'copper',
        terminalRating: 75,
        includeNeutral: false,
      };
      
      expect(() => calculateParallelConductors(input)).toThrow('at least 2 runs');
    });
    
    it('should throw error for undersized conductors', () => {
      const input: ParallelConductorInput = {
        totalAmpacity: 100, // Too small for parallel (would require < 1/0 AWG)
        numRuns: 2,
        conductorMaterial: 'copper',
        terminalRating: 75,
        includeNeutral: false,
      };
      
      // 100A / 2 = 50A per conductor → would be #8 AWG, but minimum is 1/0 for parallel
      expect(() => calculateParallelConductors(input)).toThrow('minimum 1/0 AWG');
    });
    
    it('should generate warnings for high ampacity', () => {
      const input: ParallelConductorInput = {
        totalAmpacity: 1200,
        numRuns: 4,
        conductorMaterial: 'copper',
        terminalRating: 75,
        includeNeutral: false,
      };
      
      const result = calculateParallelConductors(input);
      
      // Should have warnings about large installation
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
  
  describe('recommendParallelRuns', () => {
    it('should recommend optimal configurations', () => {
      const recommendations = recommendParallelRuns(400, 'copper', 75);
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('numRuns');
      expect(recommendations[0]).toHaveProperty('size');
      expect(recommendations[0]).toHaveProperty('efficiency');
      
      // All recommendations should be sorted by efficiency
      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i].efficiency).toBeLessThanOrEqual(recommendations[i-1].efficiency);
      }
    });
    
    it('should respect maxRuns parameter', () => {
      const maxRuns = 4;
      const recommendations = recommendParallelRuns(600, 'copper', 75, maxRuns);
      
      for (const rec of recommendations) {
        expect(rec.numRuns).toBeLessThanOrEqual(maxRuns);
      }
    });
  });
});
