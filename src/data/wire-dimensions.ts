export type WireInsulationType = 
  | 'THHN' | 'THWN' | 'THWN-2' 
  | 'THW' | 'THW-2'
  | 'TW'
  | 'XHHW' | 'XHHW-2' 
  | 'RHH' | 'RHW' | 'RHW-2' 
  | 'USE-2'
  | 'NM-B';

export interface WireDimensions {
  awg: string;
  areas: Partial<Record<WireInsulationType, number>>;
}

const thhnAreas: Record<string, number> = {
  '14': 0.0097,
  '12': 0.0133,
  '10': 0.0211,
  '8': 0.0366,
  '6': 0.0507,
  '4': 0.0824,
  '3': 0.0973,
  '2': 0.1158,
  '1': 0.1562,
  '1/0': 0.1855,
  '2/0': 0.2223,
  '3/0': 0.2679,
  '4/0': 0.3237,
  '250': 0.3970,
  '300': 0.4608,
  '350': 0.5242,
  '400': 0.5863,
  '500': 0.7073,
  '600': 0.8676,
  '750': 1.0496,
  '1000': 1.3478
};

const multipliers: Record<WireInsulationType, (awg: string) => number | null> = {
  THHN: () => 1.0,
  THWN: () => 1.0,
  'THWN-2': () => 1.0,
  TW: (awg) => {
    if (['14', '12', '10', '8'].includes(awg)) return 1.35;
    if (['6', '4', '3', '2'].includes(awg)) return 1.25;
    if (['1', '1/0', '2/0', '3/0', '4/0'].includes(awg)) return 1.18;
    if (['250', '300', '350', '400', '500', '600', '750', '1000'].includes(awg)) return 1.14;
    return 1.0;
  },
  THW: (awg) => {
    if (['14', '12', '10', '8'].includes(awg)) return 1.25;
    if (['6', '4', '3', '2'].includes(awg)) return 1.20;
    if (['1', '1/0', '2/0', '3/0', '4/0'].includes(awg)) return 1.15;
    if (['250', '300', '350', '400', '500', '600', '750', '1000'].includes(awg)) return 1.12;
    return 1.0;
  },
  'THW-2': (awg) => {
    if (['14', '12', '10', '8'].includes(awg)) return 1.25;
    if (['6', '4', '3', '2'].includes(awg)) return 1.20;
    if (['1', '1/0', '2/0', '3/0', '4/0'].includes(awg)) return 1.15;
    if (['250', '300', '350', '400', '500', '600', '750', '1000'].includes(awg)) return 1.12;
    return 1.0;
  },
  XHHW: () => 1.15,
  'XHHW-2': () => 1.15,
  RHH: (awg) => {
    if (['14', '12', '10', '8'].includes(awg)) return 1.40;
    if (['6', '4', '3', '2'].includes(awg)) return 1.30;
    if (['1', '1/0', '2/0', '3/0', '4/0'].includes(awg)) return 1.22;
    if (['250', '300', '350', '400', '500', '600', '750', '1000'].includes(awg)) return 1.18;
    return 1.0;
  },
  RHW: (awg) => {
    if (['14', '12', '10', '8'].includes(awg)) return 1.40;
    if (['6', '4', '3', '2'].includes(awg)) return 1.30;
    if (['1', '1/0', '2/0', '3/0', '4/0'].includes(awg)) return 1.22;
    if (['250', '300', '350', '400', '500', '600', '750', '1000'].includes(awg)) return 1.18;
    return 1.0;
  },
  'RHW-2': (awg) => {
    if (['14', '12', '10', '8'].includes(awg)) return 1.40;
    if (['6', '4', '3', '2'].includes(awg)) return 1.30;
    if (['1', '1/0', '2/0', '3/0', '4/0'].includes(awg)) return 1.22;
    if (['250', '300', '350', '400', '500', '600', '750', '1000'].includes(awg)) return 1.18;
    return 1.0;
  },

  'USE-2': () => 1.15,
  'NM-B': (awg) => {
    if (['14', '12', '10', '8'].includes(awg)) return 2.5;
    if (['6', '4', '2'].includes(awg)) return 2.8;
    
    return null;
  }
};

const wireDimensions: WireDimensions[] = Object.keys(thhnAreas).map(awg => {
  const areas: Partial<Record<WireInsulationType, number>> = {};
  for (const type of Object.keys(multipliers) as WireInsulationType[]) {
    const multiplier = multipliers[type](awg);
    if (multiplier !== null) {
      areas[type] = parseFloat((thhnAreas[awg] * multiplier).toFixed(4));
    }
  }
  return { awg, areas };
});

export const wireSizes: Record<string, WireDimensions> = Object.fromEntries(wireDimensions.map(dim => [dim.awg, dim]));

export function getWireArea(awg: string, insulation: WireInsulationType): number {
  const dimensions = wireSizes[awg];
  return dimensions ? (dimensions.areas[insulation] || 0) : 0;
}

export const insulationLabels: Record<WireInsulationType, string> = {
  THHN: 'THHN',
  THWN: 'THWN',
  'THWN-2': 'THWN-2',
  TW: 'TW',
  THW: 'THW',
  'THW-2': 'THW-2',
  XHHW: 'XHHW',
  'XHHW-2': 'XHHW-2',
  RHH: 'RHH',
  RHW: 'RHW',
  'RHW-2': 'RHW-2',

  'USE-2': 'USE-2',
  'NM-B': 'NM-B (Romex)'
};
