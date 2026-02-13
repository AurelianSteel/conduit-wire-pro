/**
 * Conduit Fill Calculator Engine
 * 
 * Fill rules (industry standard):
 * - 1 conductor: 53% max fill
 * - 2 conductors: 31% max fill
 * - 3+ conductors: 40% max fill
 * 
 * Algorithm: Sum wire areas → compare to conduit area × fill %
 */

import { conduitSizes, ConduitType, ConduitSize } from '../data/conduit-dimensions';
import { getWireArea, WireInsulationType } from '../data/wire-dimensions';

export interface WireEntry {
  awg: string;
  insulation: WireInsulationType;
  quantity: number;
}

export interface ConduitFillInput {
  conduitType: ConduitType;
  conduitSize?: string;       // If specified, check this size
  wires: WireEntry[];
}

export interface ConduitFillResult {
  totalWireArea: number;       // sq inches
  conductorCount: number;
  fillPercentAllowed: number;  // 53, 31, or 40
  conduitSize: string;
  conduitArea: number;         // sq inches (total internal)
  allowableArea: number;       // conduitArea × fill%
  fillPercent: number;         // actual fill %
  passes: boolean;
  remainingArea: number;       // sq inches remaining
}

export interface ConduitRecommendation {
  selectedResult: ConduitFillResult | null;  // result for specific size (if given)
  minimumSize: ConduitFillResult | null;     // smallest passing size
  allResults: ConduitFillResult[];           // all sizes checked
}

function getFillPercentage(conductorCount: number): number {
  if (conductorCount <= 0) return 0;
  if (conductorCount === 1) return 53;
  if (conductorCount === 2) return 31;
  return 40;
}

function calculateForSize(
  conduitType: ConduitType,
  conduit: ConduitSize,
  totalWireArea: number,
  conductorCount: number,
): ConduitFillResult | null {
  const conduitArea = conduit.areas[conduitType];
  if (conduitArea == null) return null;

  const fillPercentAllowed = getFillPercentage(conductorCount);
  const allowableArea = conduitArea * (fillPercentAllowed / 100);
  const fillPercent = conduitArea > 0 ? (totalWireArea / conduitArea) * 100 : 0;

  return {
    totalWireArea: Math.round(totalWireArea * 10000) / 10000,
    conductorCount,
    fillPercentAllowed,
    conduitSize: conduit.tradeSize,
    conduitArea,
    allowableArea: Math.round(allowableArea * 10000) / 10000,
    fillPercent: Math.round(fillPercent * 100) / 100,
    passes: totalWireArea <= allowableArea,
    remainingArea: Math.round((allowableArea - totalWireArea) * 10000) / 10000,
  };
}

export function calculateConduitFill(input: ConduitFillInput): ConduitRecommendation {
  // Sum wire areas
  let totalWireArea = 0;
  let conductorCount = 0;
  for (const wire of input.wires) {
    const area = getWireArea(wire.awg, wire.insulation);
    totalWireArea += area * wire.quantity;
    conductorCount += wire.quantity;
  }

  // Check all sizes for this conduit type
  const allResults: ConduitFillResult[] = [];
  let minimumSize: ConduitFillResult | null = null;
  let selectedResult: ConduitFillResult | null = null;

  for (const conduit of conduitSizes) {
    const result = calculateForSize(input.conduitType, conduit, totalWireArea, conductorCount);
    if (result) {
      allResults.push(result);
      if (result.passes && !minimumSize) {
        minimumSize = result;
      }
      if (input.conduitSize && conduit.tradeSize === input.conduitSize) {
        selectedResult = result;
      }
    }
  }

  return { selectedResult, minimumSize, allResults };
}
