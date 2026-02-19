# Conduit & Wire Pro - Marketing Posts

## Twitter Posts

### Launch Announcement (280 chars)
```
🔧 Conduit & Wire Pro — 5 essential NEC calculators for electricians

✅ Conduit Fill
✅ Box Fill  
✅ Voltage Drop
✅ Wire Ampacity (with derating)
✅ Motor Branch Circuits

Based on NEC 2023 standards. No subscriptions. No ads.

⚠️ DISCLAIMER: For reference only. Always verify with a licensed electrician and local AHJ.

Coming soon to iOS & Android 🔥

#electrician #NEC2023
```

### Feature Highlight - Wire Ampacity
```
⚡ New: Wire Ampacity Calculator

Calculate derated ampacity with NEC 310.15:
• Temperature correction (30-50°C)
• Conductor count adjustment (1-41+)
• Continuous load factor
• 4 insulation types

Real NEC formulas, not lookup tables 📐

#electrician #NEC
```

### Feature Highlight - Motor Circuit
```
⚙️ Motor Branch Circuit Calculator

Size motor circuits per NEC Article 430:
• Conductor sizing (125% rule)
• OCPD selection
• Disconnect rating
• Overload protection

Covers 1/6 HP → 200 HP, all voltages 🔌

#electrician #NEC2023
```

### Problem/Solution Format
```
Tired of flipping through the codebook on a ladder? 📖

Conduit & Wire Pro puts NEC 2023 calculations in your pocket:
• Conduit fill
• Wire derating
• Voltage drop
• Motor circuits
• Box fill

Built by an electrician, for electricians 🔧
```

### Comparison Hook
```
Most electrical apps:
❌ $10-30/year subscriptions
❌ Outdated NEC codes
❌ Clunky interfaces
❌ Missing key calculators

Conduit & Wire Pro:
✅ One-time purchase ($4.99)
✅ Based on NEC 2023 standards
✅ Modern UI
✅ 5 essential tools

⚠️ For reference only. Verify with licensed electrician and local AHJ.

Launching Feb 2026 🚀
```

---

## Reddit Posts

### r/electricians - Launch Post
**Title:** I built an NEC calculator app because I was tired of paying subscriptions

**Body:**
```
After years of using overpriced electrical apps with outdated code references, I decided to build my own. 

**Conduit & Wire Pro** — 5 NEC 2023 calculators in one app:

1. **Conduit Fill** - Size your conduit with NEC Chapter 9 compliance
2. **Box Fill** - Calculate device box capacity (314.16)
3. **Voltage Drop** - Wire sizing for 2-5% drop limits
4. **Wire Ampacity** - Full derating (temp, conductor count, continuous load)
5. **Motor Branch Circuits** - Complete NEC 430 calculations

**What makes it different:**
- **Based on NEC 2023 standards** - Not stuck on 2017 or 2020
- **Formula-based calculations** - Not just table lookups
- **One-time purchase** - No subscriptions ($4.99 when launched)
- **No ads, no tracking** - Built for the trade, not for data harvesting

**DISCLAIMER:** This app provides reference calculations only. Always verify with a licensed electrician and your local Authority Having Jurisdiction (AHJ) before installation.

I'm an inside wireman in LA County, so I built this with real job site needs in mind. Currently in beta testing on iOS (Android coming soon).

**Example:** The Wire Ampacity calculator handles ambient temp correction, conductor count adjustment, continuous load factor, and 4 insulation types — all the stuff you actually need on the job, not just a static table from 2014.

Feedback welcome. I want to make sure this actually solves problems for working electricians, not just look good in screenshots.

---

*Launching February 2026 on the App Store. DM if you want early access for testing.*
```

### r/electricians - Feature Deep Dive
**Title:** Wire derating calculator that actually follows NEC 310.15 (not just a table)

**Body:**
```
Been working on a wire ampacity calculator that does the math properly instead of just showing you a static table.

**What it handles:**
- **Ambient temperature correction** (30°C to 50°C / 86°F to 122°F)
- **Conductor count adjustment** (1-3 up to 41+ conductors)
- **Continuous load factor** (the 80% rule for 3+ hour loads)
- **4 insulation types** (THHN/THWN, THHN/THWN-2, XHHW-2, RHW-2)

**Example scenario:**
- #12 AWG THHN/THWN-2 (base 30A)
- 50°C ambient (attic run)
- 31-40 conductors in raceway
- Continuous load

**Calculation:**
- Temperature factor: 0.82
- Adjustment factor: 0.40
- Continuous factor: 0.80
- **Final ampacity: 6A** ⚠️

The calculator warns you when conditions are extreme (high temp + heavy loading) and suggests upsizing the wire. Way more useful than just looking up a single number in Table 310.15(B)(16).

Part of a larger NEC calculator app I'm building. Thoughts?
```

### r/electricians - Problem/Solution
**Title:** What NEC calculations do you wish you had in your pocket?

**Body:**
```
I'm building an electrical calculator app and want to make sure I'm covering the real pain points. Currently have:

- Conduit fill (Chapter 9)
- Box fill (314.16)
- Voltage drop
- Wire ampacity with full derating
- Motor branch circuits (Article 430)

**Question for the journeymen/masters here:**

What calculations do you find yourself doing most often? What makes you pull out the codebook or your phone?

I'm trying to avoid the "we have 50 calculators but none of them are actually useful" problem. Rather have 10 calculators that you use every day than 100 that look impressive in screenshots.

**Specifically curious about:**
- Service/feeder sizing (220.82 vs 220.83)
- Grounding electrode conductor sizing
- Transformer calculations
- Parallel conductor runs
- Box offset bending math

What would actually save you time on the job?

---

*Background: I'm an inside wireman in LA. Built this because I was tired of subscription apps with 2017 code references. Want to make sure I'm building something electricians will actually use.*
```

### r/SideProject - Technical Deep Dive
**Title:** Built a NEC calculator app using React Native + local AI models for $0 compute costs

**Body:**
```
**Project:** Conduit & Wire Pro - Professional electrical code calculators

**Tech Stack:**
- React Native (Expo SDK 54)
- TypeScript (zero runtime errors)
- Local LLM code generation (Qwen 3 Coder 30B)
- Jest for testing (19/19 tests passing)
- No backend (privacy-first, works offline)

**The Challenge:**
Electrical calculators need to follow National Electrical Code formulas precisely. A single math error can cause safety issues or code violations. Most apps in the space:
- Use outdated code (2017, 2020)
- Have bugs in the math
- Charge $10-30/year subscriptions
- Collect unnecessary user data

**My Approach:**
- Formula-based calculations (not table lookups)
- Comprehensive test coverage (edge cases, extreme conditions)
- Based on NEC 2023 standards
- Zero telemetry
- One-time purchase model

**DISCLAIMER:** This app provides reference calculations only and is not a substitute for professional engineering judgment or licensed electrician review.

**Cost Breakdown:**
- Development: ~$0.10 in Claude Opus API calls (used for orchestration)
- Code generation: $0 (local Ollama + Qwen 3 Coder)
- Total for 5 calculators: ~$0.10

**Example:** Wire Ampacity Calculator
- Handles 4 derating factors per NEC 310.15
- 15/15 edge case tests passing
- Validates extreme conditions (50°C + 41+ conductors = 6A final ampacity)
- UI built in one session via AI-assisted pipeline

**What worked:**
- Opus (Claude) for specs + validation
- Qwen (local) for code generation
- Clear separation: AI writes code, I verify correctness
- Test-driven development (write tests first, then implementation)

**Launch timeline:** February 2026 (iOS first, Android shortly after)

GitHub: [coming soon]
Landing page: [coming soon]

Happy to answer questions about the tech stack or electrical code implementation 🔧
```

### r/iOSProgramming - Launch Post
**Title:** Launching my first iOS app - NEC calculator suite for electricians

**Body:**
```
After 6 months of development (nights/weekends while working full-time as an electrician), I'm launching **Conduit & Wire Pro** on the App Store.

**What it does:**
5 professional electrical code calculators based on NEC 2023:
- Conduit fill
- Box fill
- Voltage drop
- Wire ampacity (with temperature/loading derating)
- Motor branch circuits

**Tech Stack:**
- React Native (Expo managed workflow)
- TypeScript
- No backend (privacy-first, works offline)
- ~3,500 lines of code
- 19 unit tests (all passing)

**Key Features:**
- Clean, modern UI (dark mode)
- Formula-based calculations (accurate NEC compliance)
- One-time purchase ($4.99)
- No subscriptions, no ads, no tracking

**Lessons Learned:**
1. **Test coverage matters** - Electrical calculations can't have bugs. 15 edge case tests for the ampacity calculator alone.
2. **TypeScript saves time** - Caught dozens of errors at compile time.
3. **Local-first = better UX** - No loading spinners, works on job sites with no signal.
4. **Dark mode by default** - Electricians work in attics, crawl spaces, panels. Bright screens suck.

**Business Model:**
Target market: ~750k licensed electricians in the US. If 1% buy at $4.99, that's $37,500 revenue. Apple takes 30% ($26,250 net). Not life-changing money, but validates the concept.

**Next Steps:**
- Launch on App Store (Feb 2026)
- Gather user feedback
- Build Android version
- Add more calculators based on demand

**Questions I'd love feedback on:**
- Pricing: Is $4.99 one-time reasonable? Competitors charge $10-30/year.
- Marketing: Best channels for reaching electricians?
- Features: What would make this a must-have tool?

App Store link: [coming soon]

Thanks for reading! Open to any feedback 🔧
```

---

## LinkedIn Post (Professional)

**Title:** From journeyman electrician to indie app developer

**Body:**
```
After years of using overpriced electrical reference apps with outdated code, I decided to build my own solution.

Introducing **Conduit & Wire Pro** — a suite of NEC 2023 calculators built by an electrician, for electricians.

🔧 5 Essential Calculators:
• Conduit Fill
• Box Fill
• Voltage Drop
• Wire Ampacity (full NEC 310.15 derating)
• Motor Branch Circuits (NEC Article 430)

💡 What Makes It Different:
✅ Based on NEC 2023 standards (not stuck on 2017)
✅ Formula-based calculations (not just lookup tables)
✅ One-time purchase (no subscriptions)
✅ Privacy-first (no tracking, works offline)

⚠️ DISCLAIMER: For reference only. Always verify with a licensed electrician and local AHJ.

📐 Built with care:
Every calculation follows the National Electrical Code precisely. Example: The Wire Ampacity calculator handles ambient temperature correction, conductor count adjustment, and continuous load factors — giving you the real-world ampacity, not just a number from a static table.

🎯 Target Market:
750,000+ licensed electricians in the US who need accurate, reliable code references on the job site.

📱 Launch Timeline:
iOS: February 2026
Android: Q1 2026

This is what happens when you combine trade knowledge with software development. Building tools for the trades, by someone who works in the trades.

Feedback welcome! Connect with me if you're in the electrical industry or building tools for skilled trades.

#Electrician #AppDevelopment #NEC2023 #SkilledTrades #IndieHacker
```

---

## Instagram Caption (Visual-Focused)

```
5 NEC calculators. One app. Zero subscriptions. 🔧⚡

Swipe to see:
1️⃣ Conduit Fill - Size your raceway
2️⃣ Box Fill - Check device box capacity
3️⃣ Voltage Drop - Wire sizing for distance
4️⃣ Wire Ampacity - Full derating per 310.15
5️⃣ Motor Circuits - Complete NEC 430 calculations

Built by an inside wireman who got tired of $30/year apps with 2017 code. 

Based on NEC 2023 standards ✅
One-time purchase ✅
No ads ✅
Works offline ✅

⚠️ For reference only. Verify with licensed electrician and local AHJ.

Launching February 2026 on iOS & Android.

DM for early access 🔥

#electrician #electricianlife #sparky #nec2023 #electricalwork #skilledtrades #tradesmen #conduitandwirepro #wirelife #journeymanelectrician
```

---

## Key Messaging Themes

1. **Built by electricians, for electricians** - Authenticity matters
2. **No subscriptions** - One-time purchase vs competitors' recurring fees
3. **NEC 2023** - Up-to-date code vs outdated apps
4. **Formula-based** - Accurate calculations, not just tables
5. **Privacy-first** - No tracking, works offline
6. **Professional UI** - Modern, dark mode, job-site-friendly

## Call-to-Actions

- "DM for early access"
- "Launching February 2026"
- "Feedback welcome"
- "What calculators would you add?"
- "Tag an electrician who needs this"

## Hashtag Strategy

**Twitter:**
#electrician #NEC2023 #skilledtrades #construction #wirework

**Instagram:**
#electrician #electricianlife #sparky #nec2023 #electricalwork #skilledtrades #tradesmen #journeymanelectrician #wirelife #constructionlife

**Reddit:**
r/electricians, r/SideProject, r/iOSProgramming, r/SkilledTrades, r/Construction
