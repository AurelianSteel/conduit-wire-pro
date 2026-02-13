import { formatWireSize } from '../../utils/wireFormatter';

describe('formatWireSize', () => {
  it('formats small AWG sizes', () => {
    expect(formatWireSize('14')).toBe('14 AWG');
    expect(formatWireSize('12')).toBe('12 AWG');
    expect(formatWireSize('10')).toBe('10 AWG');
  });

  it('formats AWG/0 sizes', () => {
    expect(formatWireSize('1/0')).toBe('1/0 AWG');
    expect(formatWireSize('2/0')).toBe('2/0 AWG');
    expect(formatWireSize('4/0')).toBe('4/0 AWG');
  });

  it('formats kcmil sizes', () => {
    expect(formatWireSize('250')).toBe('250 kcmil');
    expect(formatWireSize('300')).toBe('300 kcmil');
    expect(formatWireSize('500')).toBe('500 kcmil');
  });
});