# Conduit & Wire Pro - Changelog

## Version 1.0.2 (Unreleased)

### 🔧 Grounding Electrode Conductor (GEC) Fixes
- **Fixed GEC minimum size enforcement** - Now correctly applies NEC 250.66 minimums:
  - Copper: 8 AWG minimum (was missing this constraint)
  - Aluminum: 6 AWG minimum (was missing this constraint)
- **Fixed GEC maximum size capping** - Now correctly applies "need not be larger than":
  - Copper: 3/0 AWG maximum
  - Aluminum: 250 kcmil maximum
- **Added electrode type selector** - New UI option for GEC/MBJ sizing:
  - Standard (Table 250.66)
  - Rod/Pipe/Plate electrode (250.66(A) - max 6 AWG Cu / 4 AWG Al)
  - Concrete-Encased/Ufer electrode (250.66(B) - max 4 AWG Cu)
- **Added contextual info boxes** - Shows NEC exception text when electrode type is selected

### 📋 Technical
- Updated NEC Table 250.66 implementation with proper size comparison logic
- Added 21 comprehensive GEC/MBJ tests (was 13, now 21)
- Fixed conductor size comparison bug (AWG fractions were compared incorrectly)
- Total test count: 192 (was 182)

---

## Version 1.0.1

### 🔧 Motor Circuit Calculator Fixes
- **Fixed conductor sizing formula** - Now correctly applies 125% per NEC 430.22 (removed incorrect 156.25% continuous load multiplier)
- **Fixed HP/Voltage validation** - Added proper error handling for invalid combinations (e.g., 5HP @ 120V single-phase)
- **Fixed UI distortion** - HP buttons now wrap properly, no more horizontal scroll issues
- **Improved error messages** - Clear guidance when selected motor configuration isn't available

### ⚡ Grounding & Bonding UI Improvements  
- **OCPD Rating selector** - Now wraps to multiple lines like Motor Circuit
- **Better chip spacing** - Tighter layout, 44px min-width

### 📋 Technical
- Version bumped to **1.0.1** (build 6)
- NEC Table 310.16 ampacity corrections
- 119 NEC compliance tests added

---
*Last Updated: 2026-02-25*
