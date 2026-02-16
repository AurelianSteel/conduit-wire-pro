import { calculateMotorCircuit } from '../../services/motorCircuitService';
import { MotorCircuitInput } from '../../types/motor';

describe('motorCircuitService', () => {
  describe('calculateMotorCircuit', () => {
    it('should calculate for 5 HP 240V 3-phase motor', () => {
      const input: MotorCircuitInput = {
        hp: '5',
        voltage: '240V-3ph',
        conductorMaterial: 'copper',
        terminalRating: 75,
        continuousLoad: false,
      };
      
      const result = calculateMotorCircuit(input);
      
      expect(result.fla).toBe(6.6);
      expect(result.minConductorAmpacity).toBe(9); // 6.6 * 1.25 = 8.25 → ceil = 9
      expect(result.recommendedConductorSize).toBe('14'); // 20A rating
      expect(result.maxBreakerRating).toBe(17); // 6.6 * 2.5 = 16.5 → ceil = 17
      expect(result.necArticle).toBe('430');
    });
    
    it('should calculate for 10 HP 480V 3-phase motor', () => {
      const input: MotorCircuitInput = {
        hp: '10',
        voltage: '480V-3ph',
        conductorMaterial: 'copper',
        terminalRating: 75,
        continuousLoad: false,
      };
      
      const result = calculateMotorCircuit(input);
      
      expect(result.fla).toBe(6.1);
      expect(result.minConductorAmpacity).toBe(8);
      expect(result.recommendedConductorSize).toBe('14');
    });
    
    it('should calculate for 50 HP 240V 3-phase motor', () => {
      const input: MotorCircuitInput = {
        hp: '50',
        voltage: '240V-3ph',
        conductorMaterial: 'copper',
        terminalRating: 75,
        continuousLoad: false,
      };
      
      const result = calculateMotorCircuit(input);
      
      expect(result.fla).toBe(56.8);
      expect(result.minConductorAmpacity).toBe(71); // 56.8 * 1.25 = 71
      expect(result.recommendedConductorSize).toBe('4'); // 85A rating
    });
    
    it('should throw error for unavailable voltage', () => {
      const input: MotorCircuitInput = {
        hp: '1/6',
        voltage: '480V-3ph', // Fractional HP not available at 480V
        conductorMaterial: 'copper',
        terminalRating: 75,
        continuousLoad: false,
      };
      
      expect(() => calculateMotorCircuit(input)).toThrow();
    });
    
    it('should apply additional 125% multiplier for continuous loads', () => {
      const input: MotorCircuitInput = {
        hp: '5',
        voltage: '240V-3ph',
        conductorMaterial: 'copper',
        terminalRating: 75,
        continuousLoad: true, // Continuous load flag
      };
      
      const result = calculateMotorCircuit(input);
      
      // 6.6A FLA * 1.25 (430.22) = 8.25 → ceil = 9, then 9 * 1.25 = 11.25 → ceil = 12
      expect(result.fla).toBe(6.6);
      expect(result.minConductorAmpacity).toBe(12);
      expect(result.recommendedConductorSize).toBe('14'); // 20A still sufficient
    });
    
    it('should upsize conductor for larger continuous loads', () => {
      const input: MotorCircuitInput = {
        hp: '50',
        voltage: '240V-3ph',
        conductorMaterial: 'copper',
        terminalRating: 75,
        continuousLoad: true,
      };
      
      const result = calculateMotorCircuit(input);
      
      // 56.8A FLA * 1.25 * 1.25 = 88.75A → ceil = 89A
      // Requires #3 AWG (100A) instead of #4 AWG (85A)
      expect(result.fla).toBe(56.8);
      expect(result.minConductorAmpacity).toBe(89);
      expect(result.recommendedConductorSize).toBe('3'); // Upsized from #4
    });
  });
});