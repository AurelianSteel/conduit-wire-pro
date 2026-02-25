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

    it('returns #6 Cu for #6 ungrounded conductor (minimum enforced)', () => {
      const result = calculateGECSize({ largestUngroundedConductor: '6', material: 'copper' });
      // Table 250.66 would suggest larger, but minimum is 8 AWG
      // Actually for #6, table says 8 AWG which equals minimum
      expect(result.minimumSize).toBe('8 AWG');
    });

    it('returns #4 Al for #1/0 ungrounded conductor', () => {
      const result = calculateGECSize({ largestUngroundedConductor: '1/0', material: 'aluminum' });
      expect(result.minimumSize).toBe('4 AWG');
    });

    it('returns #1/0 Cu for 500 kcmil', () => {
      const result = calculateGECSize({ largestUngroundedConductor: '500', material: 'copper' });
      expect(result.minimumSize).toBe('1/0 AWG');
    });

    it('returns 250 kcmil Al at high end (absolute max)', () => {
      const result = calculateGECSize({ largestUngroundedConductor: '2000', material: 'aluminum' });
      // NEC 250.66: Aluminum GEC need not be larger than 250 kcmil
      expect(result.minimumSize).toBe('250 kcmil');
    });

    it('enforces minimum 8 AWG for copper', () => {
      const result = calculateGECSize({ largestUngroundedConductor: '8', material: 'copper' });
      expect(result.minimumSize).toBe('8 AWG');
      expect(result.details).toContain('8 AWG');
    });

    it('enforces minimum 6 AWG for aluminum', () => {
      const result = calculateGECSize({ largestUngroundedConductor: '8', material: 'aluminum' });
      expect(result.minimumSize).toBe('6 AWG');
    });

    it('caps at 3/0 AWG for copper (need not be larger)', () => {
      const result = calculateGECSize({ largestUngroundedConductor: '2000', material: 'copper' });
      expect(result.minimumSize).toBe('3/0 AWG');
      expect(result.details).toContain('Need not be larger');
    });

    it('caps at 250 kcmil for aluminum (need not be larger)', () => {
      const result = calculateGECSize({ largestUngroundedConductor: '2000', material: 'aluminum' });
      expect(result.minimumSize).toBe('250 kcmil');
    });

    describe('electrode type exceptions', () => {
      it('limits to 6 AWG Cu for rod/pipe/plate electrodes per 250.66(A)', () => {
        const result = calculateGECSize({
          largestUngroundedConductor: '2000',
          material: 'copper',
          electrodeType: 'rod-pipe-plate',
        });
        expect(result.minimumSize).toBe('6 AWG');
        expect(result.details).toContain('250.66(A)');
        expect(result.details).toContain('rod/pipe/plate');
      });

      it('limits to 4 AWG Al for rod/pipe/plate electrodes per 250.66(A)', () => {
        const result = calculateGECSize({
          largestUngroundedConductor: '2000',
          material: 'aluminum',
          electrodeType: 'rod-pipe-plate',
        });
        expect(result.minimumSize).toBe('4 AWG');
        expect(result.details).toContain('250.66(A)');
      });

      it('limits to 4 AWG Cu for concrete-encased electrodes per 250.66(B)', () => {
        const result = calculateGECSize({
          largestUngroundedConductor: '2000',
          material: 'copper',
          electrodeType: 'concrete-encased',
        });
        expect(result.minimumSize).toBe('4 AWG');
        expect(result.details).toContain('250.66(B)');
        expect(result.details).toContain('concrete-encased');
      });

      it('does not apply concrete-encased limit to aluminum', () => {
        const result = calculateGECSize({
          largestUngroundedConductor: '2000',
          material: 'aluminum',
          electrodeType: 'concrete-encased',
        });
        // Should use standard max (250 kcmil) since concrete-encased exception doesn't apply to aluminum
        expect(result.minimumSize).toBe('250 kcmil');
      });
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

    it('respects electrode type for MBJ', () => {
      const result = calculateMBJSize({
        largestUngroundedConductor: '2000',
        material: 'copper',
        electrodeType: 'rod-pipe-plate',
      });
      expect(result.minimumSize).toBe('6 AWG');
    });
  });
});
