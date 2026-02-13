/**
 * Wire Resistance Data — Conduit & Wire Pro
 * 
 * Resistance values calculated from CRC Handbook of Chemistry and Physics
 * resistivity constants, NOT from NEC Table 8.
 * 
 * Formula: R (Ω/1000ft) = (ρ × 1000) / A_cmil
 * 
 * Copper resistivity at 75°C: 10.371 Ω·cmil/ft
 * Aluminum resistivity at 75°C: 17.002 Ω·cmil/ft
 * 
 * Circular mil areas are standard AWG geometric constants.
 * Verified against Southwire technical data (southwire.com).
 */

export interface WireResistance {
  awg: string;
  kcmil: number;           // Circular mil area
  copperR: number;          // Ω/1000ft at 75°C (DC)
  aluminumR: number;        // Ω/1000ft at 75°C (DC)
}

// Standard AWG circular mil areas (geometric constants, not copyrightable)
const CU_RHO = 10.371;   // Copper resistivity at 75°C (Ω·cmil/ft)
const AL_RHO = 17.002;   // Aluminum resistivity at 75°C (Ω·cmil/ft)

function calcR(rho: number, cmil: number): number {
  return Math.round((rho * 1000 / cmil) * 10000) / 10000;
}

export const wireResistances: WireResistance[] = [
  { awg: '14',   kcmil: 4110,    copperR: calcR(CU_RHO, 4110),    aluminumR: calcR(AL_RHO, 4110) },
  { awg: '12',   kcmil: 6530,    copperR: calcR(CU_RHO, 6530),    aluminumR: calcR(AL_RHO, 6530) },
  { awg: '10',   kcmil: 10380,   copperR: calcR(CU_RHO, 10380),   aluminumR: calcR(AL_RHO, 10380) },
  { awg: '8',    kcmil: 16510,   copperR: calcR(CU_RHO, 16510),   aluminumR: calcR(AL_RHO, 16510) },
  { awg: '6',    kcmil: 26240,   copperR: calcR(CU_RHO, 26240),   aluminumR: calcR(AL_RHO, 26240) },
  { awg: '4',    kcmil: 41740,   copperR: calcR(CU_RHO, 41740),   aluminumR: calcR(AL_RHO, 41740) },
  { awg: '3',    kcmil: 52620,   copperR: calcR(CU_RHO, 52620),   aluminumR: calcR(AL_RHO, 52620) },
  { awg: '2',    kcmil: 66360,   copperR: calcR(CU_RHO, 66360),   aluminumR: calcR(AL_RHO, 66360) },
  { awg: '1',    kcmil: 83690,   copperR: calcR(CU_RHO, 83690),   aluminumR: calcR(AL_RHO, 83690) },
  { awg: '1/0',  kcmil: 105600,  copperR: calcR(CU_RHO, 105600),  aluminumR: calcR(AL_RHO, 105600) },
  { awg: '2/0',  kcmil: 133100,  copperR: calcR(CU_RHO, 133100),  aluminumR: calcR(AL_RHO, 133100) },
  { awg: '3/0',  kcmil: 167800,  copperR: calcR(CU_RHO, 167800),  aluminumR: calcR(AL_RHO, 167800) },
  { awg: '4/0',  kcmil: 211600,  copperR: calcR(CU_RHO, 211600),  aluminumR: calcR(AL_RHO, 211600) },
  { awg: '250',  kcmil: 250000,  copperR: calcR(CU_RHO, 250000),  aluminumR: calcR(AL_RHO, 250000) },
  { awg: '300',  kcmil: 300000,  copperR: calcR(CU_RHO, 300000),  aluminumR: calcR(AL_RHO, 300000) },
  { awg: '350',  kcmil: 350000,  copperR: calcR(CU_RHO, 350000),  aluminumR: calcR(AL_RHO, 350000) },
  { awg: '400',  kcmil: 400000,  copperR: calcR(CU_RHO, 400000),  aluminumR: calcR(AL_RHO, 400000) },
  { awg: '500',  kcmil: 500000,  copperR: calcR(CU_RHO, 500000),  aluminumR: calcR(AL_RHO, 500000) },
  { awg: '600',  kcmil: 600000,  copperR: calcR(CU_RHO, 600000),  aluminumR: calcR(AL_RHO, 600000) },
  { awg: '750',  kcmil: 750000,  copperR: calcR(CU_RHO, 750000),  aluminumR: calcR(AL_RHO, 750000) },
  { awg: '1000', kcmil: 1000000, copperR: calcR(CU_RHO, 1000000), aluminumR: calcR(AL_RHO, 1000000) },
];

export type ConductorMaterial = 'copper' | 'aluminum';
export type PhaseType = 1 | 3;

export const systemVoltages = [
  { value: 120, label: '120V 1Φ', phase: 1 as const },
  { value: 208, label: '208V 1Φ', phase: 1 as const },
  { value: 208, label: '208V 3Φ', phase: 3 as const },
  { value: 240, label: '240V 1Φ', phase: 1 as const },
  { value: 240, label: '240V 3Φ', phase: 3 as const },
  { value: 277, label: '277V 1Φ', phase: 1 as const },
  { value: 480, label: '480V 3Φ', phase: 3 as const },
  { value: 600, label: '600V 3Φ', phase: 3 as const },
];
