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
  });
});