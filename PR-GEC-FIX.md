# PR: Fix GEC Sizing per NEC Table 250.66

## Summary
Fixes the Grounding Electrode Conductor (GEC) sizing calculator to comply with NEC Table 250.66, including electrode type exceptions and proper min/max enforcement.

## Changes

### Core Logic
- Fixed AWG fraction comparison bug (1/0, 2/0 now handled correctly)
- Implemented proper NEC Table 250.66 sizing bands
- Added minimum size enforcement (8 AWG Cu, 6 AWG Al)
- Added maximum size capping (3/0 Cu, 250 kcmil Al)
- Added electrode type exceptions per 250.66(A) and 250.66(B)

### UI
- Added electrode type selector (radio buttons)
- Added contextual info boxes with NEC exception text
- Shows 250.66(A) or 250.66(B) text when electrode selected

### Tests
- Added 8 new tests (13 → 21 total for GEC)
- Tests min/max enforcement
- Tests electrode exceptions
- **All 192 tests passing**

## Test Results
```
Test Suites: 9 passed, 9 total
Tests:       192 passed, 192 total
```

## Checklist
- [x] Core logic fixed
- [x] Types updated
- [x] UI enhanced
- [x] Tests added
- [x] All tests passing
- [x] CHANGELOG updated

## Breaking Changes
None - existing functionality preserved, new electrode type field is optional.
