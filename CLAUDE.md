# CLAUDE.md — ConduitWirePro

NEC calculator app for electricians. iOS (TestFlight, com.illwired.conduitwirepro). Built with Expo + React Native + TypeScript.

## Current State

- **Build:** 5 (TestFlight)
- **Calculators:** 12 wired in `app/(tabs)/index.tsx`
- **Master branch is the source of truth** — always branch from and merge back to master

## Calculator Inventory

| # | Calculator | File | Accent |
|---|-----------|------|--------|
| 1 | Conduit Fill | `app/calc/conduit-fill.tsx` | Primary |
| 2 | Box Fill | `app/calc/box-fill.tsx` | Secondary |
| 3 | Voltage Drop | `app/calc/voltage-drop.tsx` | Green |
| 4 | Wire Ampacity | `app/calc/wire-ampacity.tsx` | Amber |
| 5 | Motor Circuit | `app/calc/motor-circuit.tsx` | Purple |
| 6 | Parallel Conductors | `app/calc/parallel-conductors.tsx` | Pink |
| 7 | Grounding & Bonding | `app/calc/grounding-bonding.tsx` | Green |
| 8 | Service Feeder | `app/calc/service-feeder.tsx` | Cyan |
| 9 | Bend Radius | `app/calc/bend-radius.tsx` | Orange |
| 10 | Pipe Bending | `app/calc/pipe-bending.tsx` | Amber |
| 11 | Transformer Sizing | `app/calc/transformer-sizing.tsx` | Purple |
| 12 | Fault Current | `app/calc/fault-current.tsx` | Red |

## Git Workflow (mandatory)

**Every task, no exceptions:**

```bash
# 1. Start from master — never build on an existing feature branch
git checkout master
git pull origin master
git checkout -b feat/<task-id>

# 2. Stage selectively — never `git add .` or `git add -A`
git add -p

# 3. Commit with a scoped conventional commit message
git commit -m "feat(conduit-fill): add support for metric conduit sizes"

# 4. Push and open a PR immediately after the work is done
git push origin feat/<task-id>
gh pr create --base master --head feat/<task-id> \
  --title "feat: <short description>" \
  --body "## What\n\n## Why\n\n## Tested\n- [ ] npx expo start (no TS errors)\n- [ ] Manually navigated to calculator"

# 5. Merge and delete the branch — don't leave it dangling
gh pr merge --squash --delete-branch
```

## Anti-Patterns (learned from history)

- **Never** build on top of an existing feature branch — always base off master
- **Never** commit backup dirs, `.backup-*`, `*.bak`, temp files — add to `.gitignore` first
- **Never** leave a feature branch unmerged after the task is complete
- **Never** use `git add .` — stage only the files your task actually changed
- **Never** duplicate calculators across branches without merging — caused 20-commit accumulation on `feat/pipe-bending-calculator`

## Adding a New Calculator

1. Create `app/calc/<name>.tsx` (use an existing calc as template — include `LegalDisclaimer`)
2. Create `src/services/<name>Service.ts` with pure calculation functions
3. Create `src/types/<name>.ts` for types
4. Wire into `app/(tabs)/index.tsx` — add entry to `calculators` array, update subtitle count
5. Add route in `app/_layout.tsx` if needed
6. Run `npx tsc --noEmit` — zero errors required before PR

## Dev Commands

```bash
npx expo start          # run dev server
npx tsc --noEmit        # type check
npm test                # jest unit tests
npm run validate        # type-check + tests
```

## Codebase Layout

```
app/
  (tabs)/index.tsx      # home screen — calculator grid
  calc/*.tsx            # one file per calculator screen
src/
  services/             # pure calculation logic (NEC formulas)
  types/                # TypeScript interfaces per calculator
  data/                 # NEC table data (wire ampacity, derating, etc.)
  components/           # shared UI (LegalDisclaimer, ShareButton, ShareSheet)
  config/features.ts    # feature flags per calculator (CalculatorId enum)
  hooks/useTheme.ts     # dark/light theme
  theme.ts              # Spacing, FontSizes, BorderRadius constants
```

## NEC References

All calculations follow **NEC 2023**. Key articles:

| Calculator | NEC Reference |
|-----------|---------------|
| Conduit Fill | Chapter 9, Table 1 |
| Box Fill | 314.16 |
| Voltage Drop | 210.19, 215.2 |
| Wire Ampacity | Table 310.16, 310.15 |
| Motor Circuit | 430.22, 430.52, Table 430.248 |
| Parallel Conductors | 310.10(G) |
| Grounding & Bonding | 250.66, 250.122 |
| Service Feeder | 220.82, 230.42 |
| Bend Radius | 300.34 |
| Pipe Bending | 358.26, 344.26 |
| Transformer Sizing | 450.3 |
| Fault Current | 110.9, 110.10, IEEE C57.12.00 |
