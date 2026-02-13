/**
 * TypeScript types for Motor Branch Circuit Calculator
 * NEC 2023 Article 430 methodology
 */

import { MotorHP, MotorVoltage } from '../data/motor-fla-data';

export type ConductorMaterial = 'copper' | 'aluminum';

export interface MotorCircuitInput {
  hp: MotorHP;
  voltage: MotorVoltage;
  conductorMaterial: ConductorMaterial;
  terminalRating: 60 | 75 | 90; // °C
  continuousLoad: boolean;
}

export interface MotorCircuitResult {
  input: MotorCircuitInput;
  fla: number;
  
  // Conductor sizing (NEC 430.22)
  minConductorAmpacity: number;
  recommendedConductorSize: string;
  
  // OCPD sizing (NEC 430.52)
  maxBreakerRating: number;
  maxFuseRating: number;
  recommendedOCPD: string;
  
  // Disconnect sizing (NEC 430.110)
  minDisconnectRating: number;
  
  // Overload protection (NEC 430.32)
  overloadMin: number;
  overloadMax: number;
  
  necArticle: string;
  warnings: string[];
}