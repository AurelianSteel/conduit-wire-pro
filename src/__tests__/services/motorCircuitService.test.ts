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
    
    it('should use 125% multiplier per NEC 430.22 (not 156.25%)', () => {
      const input: MotorCircuitInput = {
        hp: '5',
        voltage: '240V-3ph',
        conductorMaterial: 'copper',
        terminalRating: 75,
        continuousLoad: true, // Even with continuous load flag
      };
      
      const result = calculateMotorCircuit(input);
      
      // NEC 430.22 requires 125% of FLA for motor branch circuits
      // This already accounts for motor operation characteristics
      // Do NOT apply additional 125% from NEC 210.19(A)(1)
      // 6.6A FLA * 1.25 = 8.25 → ceil = 9A
      expect(result.fla).toBe(6.6);
      expect(result.minConductorAmpacity).toBe(9);
      expect(result.recommendedConductorSize).toBe('14'); // 20A sufficient
    });
    
    it('should calculate conductor sizing consistently for large motors', () => {
      const input: MotorCircuitInput = {
        hp: '50',
        voltage: '240V-3ph',
        conductorMaterial: 'copper',
        terminalRating: 75,
        continuousLoad: true, // Continuous load flag should not change result
      };
      
      const result = calculateMotorCircuit(input);
      
      // 56.8A FLA * 1.25 = 71A → ceil = 71A
      // #4 AWG @ 75°C = 85A (sufficient)
      expect(result.fla).toBe(56.8);
      expect(result.minConductorAmpacity).toBe(71);
      expect(result.recommendedConductorSize).toBe('4');
    });
  });
});