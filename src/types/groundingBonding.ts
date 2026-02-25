export type GroundingMaterial = 'copper' | 'aluminum';

export type GroundingMode = 'egc' | 'gec' | 'mbj';

export type ElectrodeType = 'standard' | 'rod-pipe-plate' | 'concrete-encased';

export type ConductorSize =
  | '8'
  | '6'
  | '4'
  | '3'
  | '2'
  | '1'
  | '1/0'
  | '2/0'
  | '3/0'
  | '4/0'
  | '250'
  | '300'
  | '350'
  | '400'
  | '500'
  | '600'
  | '700'
  | '750'
  | '800'
  | '900'
  | '1000'
  | '1250'
  | '1500'
  | '1750'
  | '2000';

export interface EGCSizingInput {
  ocpdRating: number;
  material: GroundingMaterial;
}

export interface EGCSizingResult {
  input: EGCSizingInput;
  minimumSize: string;
  necReference: '250.122';
  details: string;
}

export interface GECSizingInput {
  largestUngroundedConductor: ConductorSize;
  material: GroundingMaterial;
  electrodeType?: ElectrodeType;
}

export interface GECSizingResult {
  input: GECSizingInput;
  minimumSize: string;
  necReference: '250.66' | '250.28';
  details: string;
}
