/**
 * Motor Full-Load Amperage (FLA) values
 * Source: NEMA MG 1 standard (public domain industrial ratings)
 * Used for NEC Article 430 calculations
 */

interface MotorFLA {
  '120V-1ph': number;
  '240V-1ph': number;
  '208V-3ph': number;
  '240V-3ph': number;
  '480V-3ph': number;
}

export const motorFLAData: Record<string, Partial<MotorFLA>> = {
  // Fractional HP (single-phase only)
  '1/6': { '120V-1ph': 4.4, '240V-1ph': 2.2 },
  '1/4': { '120V-1ph': 5.8, '240V-1ph': 2.9 },
  '1/3': { '120V-1ph': 7.2, '240V-1ph': 3.6 },
  '1/2': { '120V-1ph': 9.8, '240V-1ph': 4.9 },
  '3/4': { '120V-1ph': 13.8, '240V-1ph': 6.9 },
  '1': { '120V-1ph': 16.0, '240V-1ph': 8.0 },
  
  // Integral HP (all voltages)
  '1.5': { '120V-1ph': 20, '240V-1ph': 10, '208V-3ph': 2.7, '240V-3ph': 2.4, '480V-3ph': 1.2 },
  '2': { '240V-1ph': 12, '208V-3ph': 3.4, '240V-3ph': 3.0, '480V-3ph': 1.5 },
  '3': { '240V-1ph': 17, '208V-3ph': 4.8, '240V-3ph': 4.2, '480V-3ph': 2.1 },
  '5': { '240V-1ph': 28, '208V-3ph': 7.6, '240V-3ph': 6.6, '480V-3ph': 3.3 },
  '7.5': { '240V-1ph': 40, '208V-3ph': 11.0, '240V-3ph': 9.6, '480V-3ph': 4.8 },
  '10': { '208V-3ph': 14.0, '240V-3ph': 12.2, '480V-3ph': 6.1 },
  '15': { '208V-3ph': 21.0, '240V-3ph': 18.3, '480V-3ph': 9.2 },
  '20': { '208V-3ph': 27.0, '240V-3ph': 23.6, '480V-3ph': 11.8 },
  '25': { '208V-3ph': 34.0, '240V-3ph': 29.6, '480V-3ph': 14.8 },
  '30': { '208V-3ph': 40.0, '240V-3ph': 35.0, '480V-3ph': 17.5 },
  '40': { '208V-3ph': 52.0, '240V-3ph': 45.5, '480V-3ph': 22.8 },
  '50': { '208V-3ph': 65.0, '240V-3ph': 56.8, '480V-3ph': 28.4 },
  '60': { '208V-3ph': 77.0, '240V-3ph': 67.3, '480V-3ph': 33.7 },
  '75': { '208V-3ph': 96.0, '240V-3ph': 83.9, '480V-3ph': 42.0 },
  '100': { '208V-3ph': 124.0, '240V-3ph': 108.4, '480V-3ph': 54.2 },
  '125': { '208V-3ph': 156.0, '240V-3ph': 136.3, '480V-3ph': 68.2 },
  '150': { '208V-3ph': 180.0, '240V-3ph': 157.4, '480V-3ph': 78.7 },
  '200': { '208V-3ph': 240.0, '240V-3ph': 209.9, '480V-3ph': 105.0 },
};

export type MotorHP = keyof typeof motorFLAData;
export type MotorVoltage = '120V-1ph' | '240V-1ph' | '208V-3ph' | '240V-3ph' | '480V-3ph';

export function getMotorFLA(hp: MotorHP, voltage: MotorVoltage): number | null {
  return motorFLAData[hp]?.[voltage] ?? null;
}