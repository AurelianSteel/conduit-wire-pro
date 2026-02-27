/**
 * Service/Feeder Sizing Service
 * Re-exported from @illwired/electrical-calculators
 * 
 * Original implementation preserved in backup.
 * This file now re-exports from the shared module for consistency.
 */

export {
    calculateServiceFeeder,
    applyDwellingDemandFactor,
} from '@illwired/electrical-calculators';

export type {
    RecommendedServiceSize,
    ServiceFeederInput,
    ServiceFeederBreakdown,
    ServiceFeederResult,
} from '@illwired/electrical-calculators';
