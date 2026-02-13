/**
 * Conduit Internal Areas (sq. inches)
 * Sources: Western Tube (EMT), Allied Tube (IMC/RMC), JM Eagle (PVC)
 * These are physical measurements from manufacturer catalogs.
 */

export type ConduitType = 'EMT' | 'IMC' | 'RMC' | 'PVC-40' | 'PVC-80' | 'FMC' | 'LFMC';

export interface ConduitSize {
  tradeSize: string;
  areas: Partial<Record<ConduitType, number>>;
}

export const conduitSizes: ConduitSize[] = [
  { tradeSize: '1/2',   areas: { EMT: 0.304, IMC: 0.314, RMC: 0.246, 'PVC-40': 0.217, 'PVC-80': 0.164, FMC: 0.320, LFMC: 0.320 } },
  { tradeSize: '3/4',   areas: { EMT: 0.533, IMC: 0.549, RMC: 0.445, 'PVC-40': 0.409, 'PVC-80': 0.333, FMC: 0.534, LFMC: 0.534 } },
  { tradeSize: '1',     areas: { EMT: 0.864, IMC: 0.887, RMC: 0.743, 'PVC-40': 0.688, 'PVC-80': 0.581, FMC: 0.817, LFMC: 0.817 } },
  { tradeSize: '1-1/4', areas: { EMT: 1.496, IMC: 1.526, RMC: 1.290, 'PVC-40': 1.188, 'PVC-80': 1.013, FMC: 1.286, LFMC: 1.286 } },
  { tradeSize: '1-1/2', areas: { EMT: 2.036, IMC: 2.071, RMC: 1.763, 'PVC-40': 1.635, 'PVC-80': 1.401, FMC: 1.769, LFMC: 1.769 } },
  { tradeSize: '2',     areas: { EMT: 3.356, IMC: 3.408, RMC: 2.907, 'PVC-40': 2.720, 'PVC-80': 2.345, FMC: 2.908, LFMC: 2.908 } },
  { tradeSize: '2-1/2', areas: { EMT: 4.618, IMC: 4.690, RMC: 4.044, 'PVC-40': 3.806, 'PVC-80': 3.289, LFMC: 3.960 } },
  { tradeSize: '3',     areas: { EMT: 7.069, IMC: 7.178, RMC: 6.211, 'PVC-40': 5.883, 'PVC-80': 5.105, LFMC: 5.900 } },
  { tradeSize: '3-1/2', areas: { EMT: 9.063, IMC: 9.195, RMC: 7.969, 'PVC-40': 7.583, 'PVC-80': 6.612 } },
  { tradeSize: '4',     areas: { EMT: 11.834, IMC: 11.986, RMC: 10.420, 'PVC-40': 9.969, 'PVC-80': 8.710 } },
];

export const conduitTypeLabels: Record<ConduitType, string> = {
  EMT: 'EMT (Electrical Metallic Tubing)',
  IMC: 'IMC (Intermediate Metal Conduit)',
  RMC: 'RMC (Rigid Metal Conduit)',
  'PVC-40': 'PVC Schedule 40',
  'PVC-80': 'PVC Schedule 80',
  FMC: 'FMC (Flexible Metal Conduit)',
  LFMC: 'LFMC (Liquidtight Flexible)',
};
