import {
  calculateEGCSize,
  calculateGECSize,
  calculateMBJSize,
} from '../../services/groundingBondingService';

describe('groundingBondingService', () => {
  describe('calculateEGCSize', () => {
    it('returns #14 Cu for 15A', () => {
      const result = calculateEGCSize({ ocpdRating: 15, material: 'copper' });
      expect(result.minimumSize).toBe('14 AWG');
      expect(result.necReference).toBe('250.122');
    });

    it('returns #6 Cu for 200A', () => {
      const result = calculateEGCSize({ ocpdRating: 200, material: 'copper' });
      expect(result.minimumSize).toBe('6 AWG');
    });

    it('rounds up to next table band (225A -> #4 Cu)', () => {
      const result = calculateEGCSize({ ocpdRating: 225, material: 'copper' });
      expect(result.minimumSize).toBe('4 AWG');
    });

    it('returns larger aluminum size for same OCPD', () => {
      const cu = calculateEGCSize({ ocpdRating: 600, material: 'copper' });
      const al = calculateEGCSize({ ocpdRating: 600, material: 'aluminum' });
      expect(cu.minimumSize).toBe('1 AWG');
      expect(al.minimumSize).toBe('2/0 AWG');
    });

    it('handles max OCPD value', () => {
      const result = calculateEGCSize({ ocpdRating: 6000, material: 'aluminum' });
      expect(result.minimumSize).toBe('1500 kcmil');
    });

    it('throws on out-of-range OCPD', () => {
      expect(() => calculateEGCSize({ ocpdRating: 10, material: 'copper' })).toThrow(
        'between 15A and 6000A',
      );
    });
  });

  describe('calculateGECSize', () => {
    it('returns #8 Cu for #8 ungrounded conductor', () => {
      const result = calculateGECSize({ largestUngroundedConductor: '8', material: 'copper' });
      expect(result.minimumSize).toBe('8 AWG');
      expect(result.necReference).toBe('250.66');
    });

    it('returns #4 Al for #1/0 ungrounded conductor', () => {
      const result = calculateGECSize({ largestUngroundedConductor: '1/0', material: 'aluminum' });
      expect(result.minimumSize).toBe('4 AWG');
    });

    it('returns #1/0 Cu for 500 kcmil', () => {
      const result = calculateGECSize({ largestUngroundedConductor: '500', material: 'copper' });
      expect(result.minimumSize).toBe('1/0 AWG');
    });

    it('returns 350 kcmil Al at high end', () => {
      const result = calculateGECSize({ largestUngroundedConductor: '2000', material: 'aluminum' });
      expect(result.minimumSize).toBe('350 kcmil');
    });
  });

  describe('calculateMBJSize', () => {
    it('matches GEC minimum size for same input', () => {
      const input = { largestUngroundedConductor: '1000' as const, material: 'copper' as const };
      const gec = calculateGECSize(input);
      const mbj = calculateMBJSize(input);

      expect(mbj.minimumSize).toBe(gec.minimumSize);
      expect(mbj.necReference).toBe('250.28');
    });
  });
});
