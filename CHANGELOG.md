# Conduit & Wire Pro - Version 1.0.1 Changelog

## Changes in This Build

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
- NEC Table 310.16 ampacity corrections (from previous commit)
- 119 NEC compliance tests added

## Known Issues (to be addressed)
- Motor circuit calculation edge cases need Mephisto audit (rescheduled)
- Grounding/Bonding GEC sizing needs review

## Next Steps
- Test on TestFlight
- Apple Org conversion in progress (D-U-N-S verified)

---
*Built: 2026-02-20*
