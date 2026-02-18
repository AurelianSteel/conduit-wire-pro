/**
 * Types for dwelling service/feeder sizing (NEC 220 Standard Method)
 */

export type RecommendedServiceSize = 100 | 200 | 400;

export interface ServiceFeederInput {
  squareFootage: number;
  smallApplianceCircuits?: number; // default 2
  includeLaundryCircuit?: boolean; // default true

  // Fastened-in-place appliances (sum of nameplate VA)
  fastenedAppliancesVa?: number[];

  includeRange?: boolean; // default true
  rangeVa?: number; // default 8000

  includeDryer?: boolean; // default true
  dryerVa?: number; // default 5000

  heatingVa?: number;
  coolingVa?: number;

  voltage?: number; // default 240V
}

export interface ServiceFeederBreakdown {
  generalLightingVa: number;
  smallApplianceVa: number;
  laundryVa: number;
  fastenedAppliancesVa: number;
  rangeVa: number;
  dryerVa: number;
  hvacLargestVa: number;

  connectedLoadVa: number;
  demandAdjustedVa: number;
}

export interface ServiceFeederResult {
  input: Required<ServiceFeederInput>;
  breakdown: ServiceFeederBreakdown;

  calculatedAmps: number;
  recommendedService: RecommendedServiceSize;
  utilizationPercent: number;
  exceeds80PercentRule: boolean;

  necArticle: string;
  warnings: string[];
}
