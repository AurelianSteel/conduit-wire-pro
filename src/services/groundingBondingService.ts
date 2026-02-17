import {
  ConductorSize,
  EGCSizingInput,
  EGCSizingResult,
  GECSizingInput,
  GECSizingResult,
} from '../types/groundingBonding';

const EGC_TABLE = [
  { maxOcpd: 15, copper: '14 AWG', aluminum: '12 AWG' },
  { maxOcpd: 20, copper: '12 AWG', aluminum: '10 AWG' },
  { maxOcpd: 60, copper: '10 AWG', aluminum: '8 AWG' },
  { maxOcpd: 100, copper: '8 AWG', aluminum: '6 AWG' },
  { maxOcpd: 200, copper: '6 AWG', aluminum: '4 AWG' },
  { maxOcpd: 300, copper: '4 AWG', aluminum: '2 AWG' },
  { maxOcpd: 400, copper: '3 AWG', aluminum: '1 AWG' },
  { maxOcpd: 500, copper: '2 AWG', aluminum: '1/0 AWG' },
  { maxOcpd: 600, copper: '1 AWG', aluminum: '2/0 AWG' },
  { maxOcpd: 800, copper: '1/0 AWG', aluminum: '3/0 AWG' },
  { maxOcpd: 1000, copper: '2/0 AWG', aluminum: '4/0 AWG' },
  { maxOcpd: 1200, copper: '3/0 AWG', aluminum: '250 kcmil' },
  { maxOcpd: 1600, copper: '4/0 AWG', aluminum: '350 kcmil' },
  { maxOcpd: 2000, copper: '250 kcmil', aluminum: '400 kcmil' },
  { maxOcpd: 2500, copper: '350 kcmil', aluminum: '600 kcmil' },
  { maxOcpd: 3000, copper: '500 kcmil', aluminum: '750 kcmil' },
  { maxOcpd: 4000, copper: '700 kcmil', aluminum: '1000 kcmil' },
  { maxOcpd: 5000, copper: '1000 kcmil', aluminum: '1250 kcmil' },
  { maxOcpd: 6000, copper: '1200 kcmil', aluminum: '1500 kcmil' },
] as const;

const GEC_ORDER: ConductorSize[] = [
  '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0',
  '250', '300', '350', '400', '500', '600', '700', '750', '800', '900',
  '1000', '1250', '1500', '1750', '2000',
];

function getConductorIndex(size: ConductorSize): number {
  const idx = GEC_ORDER.indexOf(size);
  if (idx === -1) {
    throw new Error(`Unsupported conductor size: ${size}`);
  }
  return idx;
}

function formatInputSize(size: ConductorSize): string {
  return Number(size).toString() === size ? `${size} kcmil` : `${size} AWG`;
}

function getGECBand(size: ConductorSize): { cu: string; al: string } {
  const idx = getConductorIndex(size);

  if (idx <= getConductorIndex('4')) return { cu: '8 AWG', al: '6 AWG' };
  if (idx <= getConductorIndex('1/0')) return { cu: '6 AWG', al: '4 AWG' };
  if (idx <= getConductorIndex('3/0')) return { cu: '4 AWG', al: '2 AWG' };
  if (idx <= getConductorIndex('250')) return { cu: '2 AWG', al: '1/0 AWG' };
  if (idx <= getConductorIndex('500')) return { cu: '1/0 AWG', al: '3/0 AWG' };
  if (idx <= getConductorIndex('900')) return { cu: '2/0 AWG', al: '4/0 AWG' };
  if (idx <= getConductorIndex('1250')) return { cu: '3/0 AWG', al: '250 kcmil' };
  return { cu: '4/0 AWG', al: '350 kcmil' };
}

export function calculateEGCSize(input: EGCSizingInput): EGCSizingResult {
  const { ocpdRating, material } = input;

  if (!Number.isFinite(ocpdRating) || ocpdRating < 15 || ocpdRating > 6000) {
    throw new Error('OCPD rating must be between 15A and 6000A');
  }

  const row = EGC_TABLE.find((entry) => ocpdRating <= entry.maxOcpd);
  if (!row) {
    throw new Error(`No EGC table entry for ${ocpdRating}A`);
  }

  const minimumSize = material === 'copper' ? row.copper : row.aluminum;

  return {
    input,
    minimumSize,
    necReference: '250.122',
    details: `For ${ocpdRating}A OCPD with ${material} conductor, minimum EGC is ${minimumSize}.`,
  };
}

export function calculateGECSize(input: GECSizingInput): GECSizingResult {
  const { largestUngroundedConductor, material } = input;
  const band = getGECBand(largestUngroundedConductor);
  const minimumSize = material === 'copper' ? band.cu : band.al;

  return {
    input,
    minimumSize,
    necReference: '250.66',
    details: `For largest ungrounded conductor ${formatInputSize(
      largestUngroundedConductor,
    )}, minimum GEC is ${minimumSize} (${material}).`,
  };
}

export function calculateMBJSize(input: GECSizingInput): GECSizingResult {
  const gec = calculateGECSize(input);
  return {
    ...gec,
    necReference: '250.28',
    details: `For largest ungrounded conductor ${formatInputSize(
      input.largestUngroundedConductor,
    )}, minimum MBJ is ${gec.minimumSize} (${input.material}).`,
  };
}

export const groundingBondingData = {
  egcOcpdRatings: [
    15, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250,
    300, 350, 400, 450, 500, 600, 700, 800, 1000, 1200, 1600, 2000, 2500, 3000,
    4000, 5000, 6000,
  ],
  conductorSizes: GEC_ORDER,
};
