---
trigger: always_on
description: Master prompt and UI/UX design specifications for MonTrack. Defines the Modern Pastel Aurora & Soft Frosted Glassmorphism visual language, components, typography, and frontend implementation guidelines based on mobile-first reference specifications.
---

# MonTrack — UI/UX REDESIGN SPECIFICATION

## 1. OBJECTIVE

Redesign the existing **MonTrack** personal finance application to closely match the supplied **Modern Pastel Aurora Mobile UI reference**.

The reference image is the **primary visual benchmark**, not merely inspiration.

Do NOT simply add gradients, glassmorphism, or rounded corners to the existing interface. Redesign the **composition, spacing, hierarchy, card proportions, navigation, and interaction patterns**.

The result should feel like a **premium native mobile finance app**: clean, airy, minimal, compact, soft, and highly structured.

Preserve all existing business logic, calculations, storage, authentication, synchronization, and PWA functionality.

---

## 2. VISUAL TARGET

The reference establishes:

* Very light almost-white canvas
* Soft pastel aurora near the top
* Generous negative space
* Strong typography hierarchy
* Compact white cards
* Large controlled corner radius
* Extremely subtle borders
* Very soft shadows
* Small pill/chip controls
* Minimal icons
* Floating bottom navigation island
* Separate glowing FAB
* Mobile-first layout
* Controlled information density

The UI must NOT look like:

* Generic SaaS dashboard
* Admin panel
* Dense accounting software
* Desktop UI squeezed into mobile
* Tailwind component showcase
* AI-generated dashboard with excessive cards
* Neon/glowing interface
* Excessive glassmorphism

---

## 3. REFERENCE COMPOSITION

Follow this general hierarchy:

```text
Utility controls
      ↓
Date / eyebrow
      ↓
Good morning
User Name
      ↓
Primary Balance Card
      ↓
2 compact Metric Cards
      ↓
Section Header
      ↓
Recent Transactions
      ↓
Floating Navigation + FAB
```

The first screen should immediately answer:

**How much money do I have? How much have I spent? What happened recently?**

Do not display many equally prominent metrics.

---

## 4. BRANDING

Official name:

**MonTrack**

Never display these customer-facing names:

`JagaJajan`, `MoneyTrack`, `MonTrac`, `Ingat Miskin`, `iM`

Update visible branding in:

* UI
* browser/page titles
* PWA manifest
* metadata
* greetings
* toasts
* empty states
* authentication/onboarding

Do NOT rename internal database tables, IndexedDB/Dexie stores, API fields, or services unless required.

---

## 5. COLOR SYSTEM

```text
Canvas:          #F8FAFC
Primary Text:    #0F172A
Secondary Text:  #64748B
Muted Text:      #94A3B8

Blue:            #2563EB
Cyan:            #38BDF8
Violet:          #4F46E5

Income:          #10B981
Expense:         #EF4444
Warning:         #F59E0B
```

Aurora background:

```css
linear-gradient(
  180deg,
  rgba(224,242,254,.75) 0%,
  rgba(237,233,254,.45) 35%,
  #F8FAFC 85%
)
```

Keep the aurora subtle and atmospheric.

FAB gradient:

```css
linear-gradient(135deg,#38BDF8 0%,#2563EB 50%,#4F46E5 100%)
```

FAB shadow:

```css
0 10px 25px -5px rgba(37,99,235,.45)
```

Do not use strong gradients throughout the application.

---

## 6. TYPOGRAPHY

Use **Plus Jakarta Sans** globally.

```text
Primary:   Plus Jakarta Sans
Fallback:  sans-serif
```

Headings:

```text
font-semibold
tracking-tight
text-slate-900
```

Financial values:

```text
font-bold
tracking-tight
tabular-nums
text-slate-900
```

Financial numbers must never wrap or unexpectedly truncate.

Avoid excessive `font-black`.

---

## 7. MOBILE LAYOUT

Primary targets:

```text
360px
375px
390px
430px
```

Use approximately **16px horizontal page padding**.

Preferred spacing:

```text
8 / 12 / 16 / 20 / 24 / 32px
```

Maintain generous whitespace while keeping cards compact.

No body-level horizontal scrolling.

Minimum touch target: **44 × 44px**.

---

## 8. CARDS

Cards must resemble the reference: **compact, white, soft, and lightweight**.

Default:

```text
bg-white
rounded-3xl
border border-slate-100/80
```

Shadow:

```css
0 10px 30px -10px rgba(15,23,42,.04),
0 4px 6px -2px rgba(15,23,42,.02)
```

Typical padding: `16px`.

Primary cards: `20px` padding.

Do NOT make every card tall or oversized.

Do NOT use strong shadows.

Use solid white for most content cards.

---

## 9. GLASSMORPHISM

Glass is an accent, not the default.

Use:

```text
bg-white/80
backdrop-blur-md
```

only where it improves depth.

Do NOT apply blur to every card.

The reference is primarily **clean white surfaces + subtle atmospheric background**.

---

## 10. HEADER

Structure:

```text
Utility row
↓
Date / eyebrow
↓
Good morning
User Name
```

Example:

```text
Wednesday, 30 September

Good morning
Naufal,
```

Use the authenticated user's actual name.

Utility buttons such as Search, Notification, Settings/Profile:

```text
44 × 44px
rounded-full
bg-white/70
```

Keep the header airy and minimal.

---

## 11. BALANCE + METRICS

The balance is the strongest financial element.

Example:

```text
Current Balance

Rp 8.450.000

+ Rp 2.300.000 income
- Rp 850.000 expense
```

Hierarchy:

```text
Label
↓
Large financial value
↓
Supporting information
```

Below it, use compact 2-column metrics when appropriate:

```text
┌──────────────┐ ┌──────────────┐
│ Spending     │ │ Income       │
│ Rp 350K   →  │ │ Rp 1.2M   →  │
│ Today        │ │ This month   │
└──────────────┘ └──────────────┘
```

Do not create large grids of metrics.

---

## 12. SECTION HEADERS

Use compact headers:

```text
Recent Transactions                    →
```

Style:

```text
text-base
font-semibold
text-slate-900
```

Avoid oversized section headings.

---

## 13. CATEGORY CHIPS

Use compact horizontal pills:

```text
All · Food · Transport · Shopping · Bills
```

Inactive:

```text
bg-white
text-slate-500
border border-slate-100
rounded-full
```

Active:

```text
bg-slate-900
text-white
```

Do not give every category a different bright color.

---

## 14. TRANSACTIONS

Keep transaction rows compact:

```text
┌────────────────────────────────┐
│ [icon] Coffee Shop       -25K │
│        Food · Today            │
└────────────────────────────────┘
```

Use semantic colors primarily on the amount:

```text
Income  → #10B981
Expense → #EF4444
```

Do not color the entire card.

Icon container:

```text
40 × 40px
rounded-xl / rounded-full
```

---

## 15. FLOATING BOTTOM NAVIGATION

The bottom navigation is a defining element.

It MUST be a **floating island**, NOT a full-width navbar.

Recommended:

```text
position: fixed
left: 50%
transform: translateX(-50%)
bottom: 16px + safe-area
```

Width: approximately `190–240px`.

Style:

```text
bg-white/90
backdrop-blur-lg
border border-slate-100
rounded-full
shadow-xl shadow-slate-200/50
```

Navigation buttons:

```text
44 × 44px
rounded-full
```

The dock must visibly float above the page with space around it.

---

## 16. FLOATING ACTION BUTTON

Add Transaction uses a separate glowing FAB.

```text
56 × 56px
rounded-full
```

Use the specified blue/cyan/violet gradient and soft blue shadow.

Position beside the navigation dock:

```text
fixed
right: 18px
bottom: 18px + safe-area
```

The FAB must look **separate, elevated, and luminous**.

Icon: `Plus`.

Do NOT make the FAB another navigation item.

---

## 17. TRANSACTION SHEET

FAB opens a mobile bottom sheet.

Style:

```text
bg-white
rounded-t-[32px]
subtle shadow
safe-area support
```

Include a small drag handle.

All vital fields must be visible directly:

1. Amount
2. Type
3. Wallet
4. Category
5. Note
6. Date

**No nested accordions or Advanced Options.**

---

## 18. AMOUNT INPUT

Amount is the primary focus.

When opening:

* autofocus amount
* numeric keyboard
* visually dominant amount

Example:

```text
Rp

250.000
```

Avoid generic browser-looking inputs and heavy borders.

---

## 19. SAVE BUTTON

Use a fixed bottom action inside the sheet.

```text
height: 52px
rounded-full
bg-blue-600
text-white
```

Label:

**Save Transaction**

Respect `env(safe-area-inset-bottom)`.

---

## 20. ICONS + MOTION

Use **lucide-react exclusively**.

Preferred icons:

```text
House
ReceiptText
BarChart3
WalletCards
Settings
Plus
ArrowDownLeft
ArrowUpRight
Search
Bell
ChevronRight
CalendarDays
```

Do not mix icon libraries or use emojis as UI icons.

If Framer Motion exists, use subtle motion:

```text
Bottom sheet: stiffness 350, damping 30
Interactive elements: whileTap={{ scale: 0.97 }}
```

Respect `prefers-reduced-motion`.

Do not animate everything.

---

## 21. AVOID

Explicitly reject:

* Generic SaaS/admin dashboard
* Dense 3×3 card grids
* Oversized cards
* Excessive gradients
* Excessive blur
* Neon effects
* Dark glassmorphism
* Large decorative illustrations
* Random colored cards
* Emoji UI
* Full-width bottom navbar
* Oversized FAB
* Tiny touch targets
* Browser `alert()`
* Nested transaction accordions
* Desktop layout squeezed into mobile
* Heavy shadows

---

## 22. PRESERVE EXISTING ARCHITECTURE

Do NOT break:

1. IndexedDB / Dexie schemas
2. Synchronization logic
3. Financial calculations
4. Ledger entries
5. Authentication/session
6. JSON/CSV import/export
7. Service Worker
8. PWA manifest
9. Offline functionality
10. Existing API/database schemas
11. Existing business rules

Focus the redesign on:

**UI, UX, components, styling, responsive behavior, and interactions.**

Avoid unnecessary architectural refactoring.

---

## 23. IMPLEMENTATION

Before editing:

1. Inspect project structure.
2. Identify framework/styling system.
3. Identify dashboard/navigation components.
4. Identify transaction form.
5. Identify Dexie/IndexedDB logic.
6. Identify authentication/PWA logic.
7. Reuse existing handlers and services.

Suggested reusable components:

```text
AppShell
DashboardHeader
BalanceCard
MetricCard
SectionHeader
CategoryChip
TransactionItem
BottomNav
FloatingActionButton
TransactionSheet
```

Only create abstractions that improve consistency.

---

## 24. VALIDATION

Run:

```bash
tsc --noEmit
npm run lint
npm run build
```

Test visually at:

```text
360 × 800
375 × 812
390 × 844
430 × 932
```

Check:

* No horizontal body overflow
* No clipped content
* No wrapped financial values
* No navigation/FAB overlap
* Safe-area support
* 44px+ touch targets
* Correct spacing
* Correct card proportions
* Correct typography hierarchy

---

## 25. FINAL ACCEPTANCE CRITERIA

Compare the implementation directly with the supplied reference.

The result must have:

* Similar whitespace rhythm
* Similar visual density
* Similar card proportions
* Similar typography hierarchy
* Similar floating navigation composition
* Separate elevated FAB
* Soft white surfaces
* Subtle aurora atmosphere
* Minimal decoration
* Premium mobile-first appearance

The redesign is NOT complete merely because the colors match or the code compiles.

Ask:

**Does it visually feel like the supplied reference?**

If not, continue refining the UI.

### FINAL RULE

**Match the reference's visual language and composition first, then adapt it to MonTrack's financial functionality.**

The final product should feel:

**Calm · Clean · Premium · Minimal · Friendly · Financial · Mobile-first · Trustworthy**