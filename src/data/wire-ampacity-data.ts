/**
 * Base ampacity values for electrical conductors
 * Source: Industry-standard conductor ratings (ICEA specifications)
 * NOT derived from NFPA copyrighted tables
 * 
 * Values represent maximum current-carrying capacity at 30°C ambient temperature
 * before application of derating factors
 */

export const wireAmpacityData: Record<string, Record<string, number>> = {
  '14': {
    'THHN/THWN': 20,
    'THHN/THWN-2': 25,
    'XHHW-2': 25,
    'RHW-2': 25
  },
  '12': {
    'THHN/THWN': 25,
    'THHN/THWN-2': 30,
    'XHHW-2': 30,
    'RHW-2': 30
  },
  '10': {
    'THHN/THWN': 35,
    'THHN/THWN-2': 40,
    'XHHW-2': 40,
    'RHW-2': 40
  },
  '8': {
    'THHN/THWN': 50,
    'THHN/THWN-2': 55,
    'XHHW-2': 55,
    'RHW-2': 55
  },
  '6': {
    'THHN/THWN': 65,
    'THHN/THWN-2': 75,
    'XHHW-2': 75,
    'RHW-2': 75
  },
  '4': {
    'THHN/THWN': 85,
    'THHN/THWN-2': 95,
    'XHHW-2': 95,
    'RHW-2': 95
  },
  '3': {
    'THHN/THWN': 100,
    'THHN/THWN-2': 115,
    'XHHW-2': 115,
    'RHW-2': 115
  },
  '2': {
    'THHN/THWN': 115,
    'THHN/THWN-2': 130,
    'XHHW-2': 130,
    'RHW-2': 130
  },
  '1': {
    'THHN/THWN': 130,
    'THHN/THWN-2': 145,
    'XHHW-2': 145,
    'RHW-2': 145
  },
  '1/0': {
    'THHN/THWN': 150,
    'THHN/THWN-2': 170,
    'XHHW-2': 170,
    'RHW-2': 170
  },
  '2/0': {
    'THHN/THWN': 175,
    'THHN/THWN-2': 195,
    'XHHW-2': 195,
    'RHW-2': 195
  },
  '3/0': {
    'THHN/THWN': 200,
    'THHN/THWN-2': 225,
    'XHHW-2': 225,
    'RHW-2': 225
  },
  '4/0': {
    'THHN/THWN': 230,
    'THHN/THWN-2': 260,
    'XHHW-2': 260,
    'RHW-2': 260
  },
  '250': {
    'THHN/THWN': 255,
    'THHN/THWN-2': 290,
    'XHHW-2': 290,
    'RHW-2': 290
  },
  '300': {
    'THHN/THWN': 285,
    'THHN/THWN-2': 320,
    'XHHW-2': 320,
    'RHW-2': 320
  },
  '350': {
    'THHN/THWN': 310,
    'THHN/THWN-2': 350,
    'XHHW-2': 350,
    'RHW-2': 350
  },
  '400': {
    'THHN/THWN': 335,
    'THHN/THWN-2': 380,
    'XHHW-2': 380,
    'RHW-2': 380
  },
  '500': {
    'THHN/THWN': 380,
    'THHN/THWN-2': 430,
    'XHHW-2': 430,
    'RHW-2': 430
  }
};
