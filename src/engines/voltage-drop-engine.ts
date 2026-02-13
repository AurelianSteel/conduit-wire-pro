/**
 * Voltage Drop Calculator Engine
 *
 * Formulas:
 *   Single-phase: VD = 2 × I × R × L / 1000
 *   Three-phase:  VD = √3 × I × R × L / 1000
 *
 * R values from CRC Handbook resistivity (see resistance-data.ts)
 * Industry recommendation: Max 3% branch, 5% total (feeder + branch)
 */

import { wireResistances, WireResistance, ConductorMaterial, PhaseType } from '../data/resistance-data';

export interface VoltageDropInput {
  voltage: number;
  phase: PhaseType;
  current: number;
  distance: number;         // One-way distance in feet
  material: ConductorMaterial;
  wireSize?: string;
}

export interface VoltageDropResult {
  wireSize: string;
  resistance: number;
  voltageDrop: number;
  voltageDropPercent: number;
  voltageAtLoad: number;
  passes3Percent: boolean;
  passes5Percent: boolean;
}

export interface WireRecommendation {
  results: VoltageDropResult[];
  bestChoice: VoltageDropResult | null;
  smallest3Percent: VoltageDropResult | null;
  smallest5Percent: VoltageDropResult | null;
}

function getResistance(wire: WireResistance, material: ConductorMaterial): number {
  return material === 'copper' ? wire.copperR : wire.aluminumR;
}

export function calculateVoltageDrop(input: VoltageDropInput): VoltageDropResult | null {
  const wire = wireResistances.find(w => w.awg === input.wireSize);
  if (!wire) return null;

  const resistance = getResistance(wire, input.material);
  const multiplier = input.phase === 3 ? Math.sqrt(3) : 2;
  const voltageDrop = (multiplier * input.current * resistance * input.distance) / 1000;
  const voltageDropPercent = (voltageDrop / input.voltage) * 100;
  const voltageAtLoad = input.voltage - voltageDrop;

  return {
    wireSize: wire.awg,
    resistance,
    voltageDrop: Math.round(voltageDrop * 100) / 100,
    voltageDropPercent: Math.round(voltageDropPercent * 100) / 100,
    voltageAtLoad: Math.round(voltageAtLoad * 100) / 100,
    passes3Percent: voltageDropPercent <= 3,
    passes5Percent: voltageDropPercent <= 5,
  };
}

export function recommendWire(input: Omit<VoltageDropInput, 'wireSize'>): WireRecommendation {
  const results: VoltageDropResult[] = [];

  for (const wire of wireResistances) {
    const result = calculateVoltageDrop({ ...input, wireSize: wire.awg });
    if (result) results.push(result);
  }

  const meets3 = results.filter(r => r.passes3Percent);
  const smallest3Percent = meets3.length > 0 ? meets3[0] : null;

  const meets5 = results.filter(r => r.passes5Percent);
  const smallest5Percent = meets5.length > 0 ? meets5[0] : null;

  const bestChoice = smallest3Percent || smallest5Percent || null;

  return { results, bestChoice, smallest3Percent, smallest5Percent };
}

export function formatWireSize(awg: string): string {
  const kcmilSizes = ['250', '300', '350', '400', '500', '600', '750', '1000'];
  return kcmilSizes.includes(awg) ? `${awg} kcmil` : `#${awg} AWG`;
}

export function getVDStatusColor(percent: number): string {
  if (percent <= 3) return '#34C759';
  if (percent <= 5) return '#FFD60A';
  return '#FF453A';
}

export function getVDStatusLabel(percent: number): string {
  if (percent <= 3) return 'Excellent — Within 3% branch circuit limit';
  if (percent <= 5) return 'Acceptable — Within 5% total limit';
  return 'Exceeds recommended limits';
}
