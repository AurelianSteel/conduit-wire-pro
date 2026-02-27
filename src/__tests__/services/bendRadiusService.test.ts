import { calculateBendRadius, getAvailableConductorSizes, getCableTypeInfo } from '../../services/bendRadiusService';
import { BendRadiusInput, CableType } from '../../types/bendRadius';

describe('bendRadiusService', () => {
  describe('calculateBendRadius', () => {
    it('should calculate bend radius for nonshielded 12 AWG cable', () => {
      const input: BendRadiusInput = {
        cableType: 'nonshielded',
        conductorSize: '12',
      };

      const result = calculateBendRadius(input);

      expect(result.input.cableType).toBe('nonshielded');
      expect(result.input.conductorSize).toBe('12');
      expect(result.multiplier).toBe(8);
      expect(result.minRadiusInches).toBeGreaterThan(0);
      expect(result.minRadiusMm).toBeGreaterThan(0);
      expect(result.necArticle).toBe('300.34(A)');
    });

    it('should calculate bend radius for shielded cable with 8x multiplier', () => {
      const input: BendRadiusInput = {
        cableType: 'shielded',
        conductorSize: '6',
      };

      const result = calculateBendRadius(input);

      expect(result.multiplier).toBe(12);
      expect(result.necArticle).toBe('300.34(B)');
    });

    it('should calculate bend radius for MC cable with 5x multiplier', () => {
      const input: BendRadiusInput = {
        cableType: 'mc',
        conductorSize: '12',
      };

      const result = calculateBendRadius(input);

      expect(result.multiplier).toBe(5);
      expect(result.necArticle).toBe('330.24');
    });

    it('should calculate bend radius for AC cable with 5x multiplier', () => {
      const input: BendRadiusInput = {
        cableType: 'ac',
        conductorSize: '12',
      };

      const result = calculateBendRadius(input);

      expect(result.multiplier).toBe(5);
      expect(result.necArticle).toBe('320.24');
    });

    it('should use provided overall diameter when specified', () => {
      const input: BendRadiusInput = {
        cableType: 'nonshielded',
        conductorSize: '12',
        overallDiameter: 0.5,
      };

      const result = calculateBendRadius(input);

      expect(result.referenceDiameter).toBe(0.5);
      expect(result.referenceDiameterType).toContain('User-provided');
      expect(result.minRadiusInches).toBe(4.0); // 8 * 0.5
    });

    it('should calculate correctly for large kcmil conductors', () => {
      const input: BendRadiusInput = {
        cableType: 'interlocked',
        conductorSize: '750',
      };

      const result = calculateBendRadius(input);

      expect(result.multiplier).toBe(7);
      expect(result.input.conductorSize).toBe('750');
      expect(result.warnings.some(w => w.includes('Large conductor'))).toBe(true);
    });

    it('should generate warning for shielded cables > 250 kcmil', () => {
      const input: BendRadiusInput = {
        cableType: 'shielded',
        conductorSize: '350',
      };

      const result = calculateBendRadius(input);

      expect(result.warnings.some(w => w.includes('Shielded cables > 250 kcmil'))).toBe(true);
    });

    it('should generate warning when using estimated diameter', () => {
      const input: BendRadiusInput = {
        cableType: 'nonshielded',
        conductorSize: '10',
      };

      const result = calculateBendRadius(input);

      expect(result.warnings.some(w => w.includes('estimated'))).toBe(true);
    });

    it('should calculate bend radius for corrugated sheath', () => {
      const input: BendRadiusInput = {
        cableType: 'corrugated',
        conductorSize: '1/0',
      };

      const result = calculateBendRadius(input);

      expect(result.multiplier).toBe(5);
      expect(result.necArticle).toBe('300.34(E)');
    });

    it('should calculate bend radius for smooth sheath', () => {
      const input: BendRadiusInput = {
        cableType: 'smooth',
        conductorSize: '2/0',
      };

      const result = calculateBendRadius(input);

      expect(result.multiplier).toBe(8);
      expect(result.necArticle).toBe('300.34(D)');
    });

    it('should handle fractional AWG sizes correctly', () => {
      const input: BendRadiusInput = {
        cableType: 'interlocked',
        conductorSize: '1/0',
      };

      const result = calculateBendRadius(input);

      expect(result.input.conductorSize).toBe('1/0');
      expect(result.minRadiusInches).toBeGreaterThan(0);
    });

    it('should calculate consistent results for same inputs', () => {
      const input: BendRadiusInput = {
        cableType: 'nonshielded',
        conductorSize: '6',
      };

      const result1 = calculateBendRadius(input);
      const result2 = calculateBendRadius(input);

      expect(result1.minRadiusInches).toBe(result2.minRadiusInches);
      expect(result1.minRadiusMm).toBe(result2.minRadiusMm);
    });
  });

  describe('getAvailableConductorSizes', () => {
    it('should return array of conductor sizes', () => {
      const sizes = getAvailableConductorSizes();

      expect(sizes).toBeInstanceOf(Array);
      expect(sizes.length).toBeGreaterThan(0);
      expect(sizes).toContain('12');
      expect(sizes).toContain('1/0');
      expect(sizes).toContain('250');
    });

    it('should include common AWG sizes', () => {
      const sizes = getAvailableConductorSizes();

      expect(sizes).toContain('14');
      expect(sizes).toContain('12');
      expect(sizes).toContain('10');
      expect(sizes).toContain('8');
      expect(sizes).toContain('6');
      expect(sizes).toContain('4');
      expect(sizes).toContain('2');
    });

    it('should include kcmil sizes', () => {
      const sizes = getAvailableConductorSizes();

      expect(sizes).toContain('250');
      expect(sizes).toContain('300');
      expect(sizes).toContain('500');
      expect(sizes).toContain('750');
      expect(sizes).toContain('1000');
    });
  });

  describe('getCableTypeInfo', () => {
    it('should return info for nonshielded cable', () => {
      const info = getCableTypeInfo('nonshielded');

      expect(info.multiplier).toBe(8);
      expect(info.necReference).toBe('300.34(A)');
      expect(info.label).toContain('Nonshielded');
    });

    it('should return info for shielded cable', () => {
      const info = getCableTypeInfo('shielded');

      expect(info.multiplier).toBe(12);
      expect(info.necReference).toBe('300.34(B)');
    });

    it('should return info for MC cable', () => {
      const info = getCableTypeInfo('mc');

      expect(info.multiplier).toBe(5);
      expect(info.necReference).toBe('330.24');
    });

    it('should return info for AC cable', () => {
      const info = getCableTypeInfo('ac');

      expect(info.multiplier).toBe(5);
      expect(info.necReference).toBe('320.24');
    });
  });
});
