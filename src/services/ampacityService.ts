/**
 * Wire Ampacity Calculation Service
 * Re-exported from @illwired/electrical-calculators
 * 
 * Original implementation preserved in backup.
 * This file now re-exports from the shared module for consistency.
 */

export {
    calculateDeratedAmpacity,
} from '@illwired/electrical-calculators';

export type {
    WireSize,
    InsulationType,
    ConductorCountRange,
    AmpacityInput,
    AmpacityResult,
    insulationTempRatings,
} from '@illwired/electrical-calculators';
