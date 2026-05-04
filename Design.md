# L'Étudiant Fair — Design Document
> For use with Google Stitch to generate a new UI.

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Design Tokens](#2-design-tokens)
3. [Graphical Assets](#3-graphical-assets)
4. [Component Library](#4-component-library)
5. [Screen Descriptions](#5-screen-descriptions)

---

## 1. Brand Identity

**App Name**: L'Étudiant Fair  
**Product type**: Mobile-first progressive web app (PWA) for French educational orientation fairs  
**Target users**: Students (primary), teachers, parents, school exhibitors, admins  
**Brand voice**: Bold, energetic, editorial — feels like a magazine meets a social app

### Brand Signature

The L'Étudiant brand is identified by two recurring motifs:

- **3-color stripe** (`le-stripe`): A thin horizontal bar split into three equal bands — Tomate red / Piscine blue / Citron yellow. Used as a page-top accent.
- **8-color rainbow stripe** (`le-stripe-multi`): A wider multicolor gradient across 8 hues (hot pink → orange → yellow → lime → teal green → cyan → royal blue → dark purple). Used in footers, section dividers, and decorative elements.

---

## 2. Design Tokens

### 2.1 Color Palette

#### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Tomate** | `#EC1F27` | Brand primary — CTAs, student role, alerts, active states |
| **Blanc** | `#F8F7F2` | Off-white background (warm, not pure white) |
| **Noir** | `#191829` | Headings and primary text (deep navy-black) |

#### Secondary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Piscine** | `#0066CC` | Blue — links, info, teacher role |
| **Citron** | `#FCD716` | Yellow — highlights, badges, warnings |
| **Spirit** | `#FF6B35` | Orange — exhibitor role, secondary accent |
| **Framboise** | `#E91E63` | Hot pink — secondary accent, multicolor stripe |
| **Menthe** | `#4DB8A8` | Teal — success, positive actions |
| **Tropical** | `#00BFB3` | Cyan — info |
| **Lagoon** | `#00AA88` | Dark teal — nav active, partnerships |
| **Nuit** | `#2B1B4D` | Dark purple — dark sections, footer |
| **Pourpre** | `#932D99` | Purple — parent role |
| **Paen** | `#004488` | Dark blue — high-contrast text on blue bg |
| **Papyri** | `#CDDC39` | Lime — multicolor stripe only |

#### Light Variants (card/badge backgrounds)

| Name | Hex |
|------|-----|
| `red-light` | `#FFF0F1` |
| `blue-light` | `#E6F0FF` |
| `yellow-light` | `#FEF3C7` |

#### Dark Variants

| Name | Hex | Usage |
|------|-----|-------|
| `red-dark` | `#C41520` | Hover state for Tomate |

#### Grays

| Token | Hex | Usage |
|-------|-----|-------|
| `gray-900` | `#1A1A1A` | Black text |
| `gray-700` | `#3D3D3D` | Medium-dark text |
| `gray-500` | `#6B6B6B` | Muted/secondary text |
| `gray-300` | `#D4D4D4` | Borders |
| `gray-200` | `#E8E8E8` | Light borders |
| `gray-100` | `#F4F4F4` | Light backgrounds |
| `gray-50` | `#FAFAFA` | Subtle background |

---

### 2.2 Typography

All text uses `-webkit-font-smoothing: antialiased` and tight letter-spacing on headings.

| Class | Size | Weight | Use |
|-------|------|--------|-----|
| `.le-display` | `clamp(2.5rem, 5vw, 4rem)` | 900 | Hero headlines — huge, fluid |
| `.le-h1` | `clamp(1.75rem, 3vw, 2.25rem)` | 800 | Page titles |
| `.le-h2` | `1.5rem` | 800 | Section titles |
| `.le-h3` | `1.125rem` | 700 | Subsection titles |
| `.le-body` | `0.9375rem` | 400 | Body copy, line-height 1.6 |
| `.le-caption` | `0.75rem` | 500 | Secondary/meta text |
| `.le-section-label` | `11px` | 800 | Eyebrow labels — all-caps, 4px red underline |
| `.le-quote` | `1.25rem` | 700 | Editorial pull quotes |

Heading letter-spacing: `-0.03em` to `-0.04em` (condensed feel).

---

### 2.3 Spacing & Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |
| `--radius-xl` | `24px` |
| `--radius-2xl` | `32px` |

---

### 2.4 Shadows

| Token | Value |
|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(16,24,40,0.06)` |
| `--shadow-sm` | `0 1px 3px rgba(16,24,40,0.08)` |
| `--shadow-md` | `0 4px 8px -2px rgba(16,24,40,0.08)` |
| `--shadow-lg` | `0 12px 24px -6px rgba(16,24,40,0.10)` |
| `--shadow-xl` | `0 24px 48px -12px rgba(16,24,40,0.18)` |
| `--shadow-glow-red` | `0 8px 24px -4px rgba(236,31,39,0.22)` |
| `--shadow-glow-blue` | `0 8px 24px -4px rgba(0,102,204,0.22)` |

---

### 2.5 Animation

| Class | Effect | Duration |
|-------|--------|----------|
| `.le-fade-in` | Fade + slide up | 0.55s |
| `.le-slide-up` | Translate Y + fade | 0.55s |
| `.le-scale-in` | Scale 0.96→1 + fade | 0.45s |
| `.le-shimmer` | Shimmer loading effect | — |
| `.le-breathe` | Pulsing red glow | 2s loop |
| `.le-pulse-dot` | Dot scale pulse | 1.8s loop |

Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (smooth ease-out) for most transitions.

---

### 2.6 Buttons

| Variant | Background | Text | Notes |
|---------|-----------|------|-------|
| `le-btn-primary` | Tomate `#EC1F27` | White | Red glow shadow on hover, 2px lift |
| `le-btn-secondary` | Transparent | Tomate | Tomate border, red bg on hover |
| `le-btn-ghost` | Transparent | Gray-700 | Gray-200 border, gray-100 bg on hover |
| `le-btn-premium` | Gradient (Tomate → dark red) | White | Enhanced red glow, lift on hover |

All buttons: `border-radius: var(--radius-sm)` (8px), `transition: var(--ease-out)`.

---

### 2.7 Badges & Tags

| Variant | Background | Text Color | Use |
|---------|-----------|-----------|-----|
| Red | `#FFF0F1` | `#C41520` | Alerts, Parcoursup |
| Blue | `#E6F0FF` | `#0066CC` | Info, formation type |
| Yellow | `#FEF3C7` | `#7A6200` | Caution, apprenticeship |
| Gray | `#F4F4F4` | `#3D3D3D` | Neutral, secondary |

Shape: `border-radius: 999px`, `font-size: 10–11px`, `font-weight: 600–700`.

---

### 2.8 Orientation Stage Model

Students are classified in three intent stages — color-coded throughout the UI:

| Stage | Label | Badge Color | Progress Bar | Meaning |
|-------|-------|------------|-------------|---------|
| Low | Exploring | Yellow (`#FCD716`) | Yellow | Browsing, no clear goal |
| Medium | Comparing | Blue (`#0066CC`) | Blue | Shortlisting schools |
| High | Deciding | Red (`#EC1F27`) | Red | Ready to apply |

---

## 3. Graphical Assets

### 3.1 Logo

**File**: `/public/logo.png` (84.5 KB)  
**Description**: The L'Étudiant brand wordmark/logo. Contains the stylized "L'Étudiant" logotype. Used in top navigation bars (light and dark variants), auth pages, and the PWA splash screen. The logo component supports two variants — `default` (with color) and `mono` (monochrome) — and three sizes: `sm`, `md`, `lg`.

---

### 3.2 PWA Icons

**File**: `/public/icons/icon-192.png`  
**Description**: Square app icon, 192×192px. Used as the home screen icon when the PWA is installed on Android devices. Contains the L'Étudiant mark on a colored background.

**File**: `/public/icons/icon-512.png`  
**Description**: Square app icon, 512×512px. High-resolution version for PWA splash screens and store listings.

---

### 3.3 SVG Utility Icons

These are generic SVG icons found in `/public/`. They are used in the default Next.js scaffold; they may not be visible in the live app UI.

| File | Description |
|------|-------------|
| `file.svg` | Document/file icon — a rectangular page outline with folded top-right corner |
| `globe.svg` | Globe/web icon — a circle with latitude and longitude lines suggesting worldwide connectivity |
| `icon.svg` | Generic app icon mark |
| `next.svg` | Next.js framework logotype — black wordmark "NEXT.JS" |
| `vercel.svg` | Vercel deployment platform triangle logotype |
| `window.svg` | Window/screen layout icon — rectangle with a thin header bar, suggesting a browser or app frame |

---

### 3.4 QR Codes (Dynamic, Runtime-Generated)

**Directory**: `/public/qr/`  
**Description**: QR codes are generated at runtime and saved here. Each student has a personal QR code that encodes their unique student ID. Booth staff scan this QR code to capture a lead during a fair. QR codes are rendered as `<canvas>` elements using the `qrcode` library and can be downloaded as PNG. They are black-and-white square matrix codes, optionally branded with the L'Étudiant logo overlaid at center.

---

### 3.5 Decorative Patterns (CSS-Generated)

These visual elements are generated entirely with CSS gradients — no image files required.

**3-Color Stripe** (`le-stripe`)
- A 6px tall horizontal bar
- Left third: Tomate red `#EC1F27`
- Center third: Piscine blue `#0066CC`
- Right third: Citron yellow `#FCD716`
- Appears at the very top of page headers and as section dividers

**8-Color Rainbow Stripe** (`le-stripe-multi`)
- A wider horizontal gradient bar
- Colors left to right: Hot pink `#E91E63` → Orange `#FF6B35` → Yellow `#FCD716` → Lime `#CDDC39` → Teal `#00AA66` → Cyan `#00BFB3` → Royal blue `#0066CC` → Dark purple `#2B1B4D`
- Used in footer, homepage colorblock, and decorative accents

**Auth Page Background** (`le-auth-bg`)
- A radial gradient composition on a warm cream base (`#F8F7F2`)
- Three soft color blobs: red glow at top-left (12%, 15%), blue glow at top-right (88%, 12%), yellow glow at bottom-center (50%, 95%)
- Creates a warm, energetic editorial mood

**Card Surface** (`le-surface`)
- White background with a barely-visible border (`rgba(16,24,40,0.04)`) and `shadow-lg`
- `border-radius: var(--radius-lg)` (16px)

**Red Accent Bar** (`le-accent-bar`)
- A 3–4px wide vertical bar in Tomate red
- Used as a left border on KPI cards, list items, and insight panels to draw the eye

---

### 3.6 Formation Swipe Cards (Dynamic CSS Gradients)

Each formation card on the Discover/Swipe screen has a unique gradient background generated dynamically. The gradients follow a set palette of combinations:
- Deep blue to teal
- Dark red to orange
- Dark purple to pink
- Deep teal to green
- Dark navy to royal blue

Cards also feature a large semi-transparent emoji watermark (e.g., 🎓, 📐, 💻, 🎨) positioned at bottom-right as a decorative subject indicator.

---

### 3.7 Floor Plan SVG (Inline, Dynamic)

**Location**: Rendered inline in `/app/(student)/fair/[eventId]/page.tsx`  
**Description**: A 2D top-down fair floor plan rendered as an SVG (570×265px viewBox). Elements:
- **Stand rectangles**: 50×36px blocks arranged in a 5-row × 7-column grid with vertical aisle separators
- **Aisle labels**: "A", "B", "C" — gray separator columns between stand blocks
- **Conference room**: A green rectangle on the right side labeled "Conférences"
- **Entrance**: A pink/red band at the bottom of the map labeled "ENTRÉE"
- **Color coding by school category**:
  - Blue: Commerce / Business
  - Purple: Specialized schools
  - Orange: Training / Professional
  - Green: Partners / Associations
  - Red: Recruiters
  - Cyan: Engineering
  - Yellow: Universities
  - Light blue: Grandes Écoles
  - Pink: Art & Design
  - Teal green: Architecture
- **Interactive states**: Hovered stand gets an enhanced drop shadow + brighter stroke; selected stand gets a colored ring

---

## 4. Component Library

### 4.1 Layout Components

**StripeRule**
- A thin horizontal divider using the 3-color or 8-color stripe pattern
- Used between sections to maintain brand rhythm

**StudentBottomNav** (mobile fixed footer)
- 5-tab bottom navigation bar, fixed at bottom of viewport
- Height: 64px + safe-area inset
- Items (left to right): Home (house icon), Discover (compass icon), QR (center — elevated, slightly larger), Saved (bookmark icon), Profile (person icon)
- Active tab: Tomate color with colored SVG stroke
- Inactive tabs: Gray-500 with gray SVG stroke
- Labels: 10px, 600 weight, below each icon
- Background: White with a 1px top border

**AdminSideNav**
- 248px wide vertical sidebar
- Background: gradient from `#1F1B36` (top) to `#15121F` (bottom) — deep dark purple-black
- Logo at top (white/mono variant)
- Nav items: 11px font, light gray text, hover shows subtle white-tinted background
- Active item: Red left accent bar (3px) + red-tinted background gradient + white text
- Section headings: Tiny uppercase labels in gray-400
- Bottom: User avatar + name + logout button

**ExhibitorSideNav / TeacherSideNav**
- Same structure as AdminSideNav
- Different nav items and accent colors

---

### 4.2 UI Primitives

**Button**
- See §2.6 for all variants
- Heights: `sm` (32px), `md` (40px, default), `lg` (48px)
- All buttons have 0.15s transitions on hover states

**Input**
- Border: 1px `gray-200` → Tomate on focus
- Focus ring: `0 0 0 3px rgba(236,31,39,0.10)`
- Padding: 12px horizontal, 10px vertical
- Radius: `--radius-sm` (8px)
- Label: 13px, 600 weight, gray-700

**Card**
- Base: White bg, 1px border (`rgba(16,24,40,0.04)`), shadow-xs, radius-md
- Interactive: + hover lift (`translateY(-2px)`), shadow-md transition
- Elevated: radius-xl, shadow-lg

**Modal**
- Backdrop: `rgba(0,0,0,0.6)` with blur
- Panel: White bg, radius-xl, shadow-xl
- Header: Content-specific (gradient for articles/videos, white for forms)
- Close button: Top-right ghost circle button

**Tag/Badge**
- See §2.7
- Pill shape (`border-radius: 999px`)

**Skeleton Loader**
- Gray-100 background with shimmer animation sweep
- Variants: `card` (rectangle), `text` (thin horizontal bar)

**EmptyState**
- Centered layout: large emoji/icon + h3 title + body text + optional CTA button
- Used when lists/tabs have no content

**OrientationBadge**
- Pill badge with colored dot (●) + stage label
- Colors per stage: See §2.8

**SectionLabel**
- All-caps 11px text in gray-600
- 2px red underline beneath, centered or left-aligned
- Used as eyebrow text above section titles

**Toaster / Toast**
- Dark semi-transparent background (`rgba(25,24,41,0.90)`)
- White text, 14px
- Emoji prefix for type (✅ success, ❌ error, 💡 info)
- Slides in from bottom, auto-dismisses after 3s

**KPI Card (Admin/Exhibitor)**
- White bg, 1px border, radius-lg
- Left accent bar: 3px Tomate (or category color) vertical strip
- Value: 28px, 800 weight, dark
- Label: 12px, gray-500
- Hover: lift + shadow-md + color glow

---

### 4.3 Feature Components

**SchoolCard**
- List item card: emoji/initial avatar (colored bg) + school name + city + type + 3 badge pills + chevron `›`
- Used in Schools directory and Suggested grid on Student Home

**FormationSwipeCard**
- Gradient background card (full-bleed color)
- Front face: Large italic white title (formation name), school name below, city, type badge, fields as tag pills, emoji watermark
- Back face (on 3D flip): Same header + detail table (duration, level, modality, admission, cost)
- 3D CSS `transform: rotateY(180deg)` for flip animation

**BoothVisitWidget**
- Compact card linking student to their visited booths list
- Icon + "Mes visites de stands" label + badge count + chevron

**ServicesBar**
- Horizontal scrollable row of compact action icon-buttons
- Each: small icon + 2-line label below, rounded square shape

**SchoolRecommendationsCard**
- "Pour vous" label + 2×3 grid of school tiles
- Each tile: colored gradient background + initial letter + school name + city overlay at bottom

---

## 5. Screen Descriptions

---

### Screen 1 — Landing / Homepage (`/`)

**Purpose**: Marketing homepage presenting the platform to all role types before login.

**Layout**: Full-page scroll, mobile-responsive

**Header / Navbar**
- Sticky top navbar on scroll
- Left: L'Étudiant logo (color variant)
- Right: "Espace Établissement" ghost link + "Se connecter" Tomate primary button
- 3-color stripe (`le-stripe`) runs along the very top edge of the page

**Hero Section**
- Left column: Large `.le-display` heading "Votre compagnon d'orientation" (white text on dark bg), subheading body text, primary CTA button "Découvrir les salons"
- Right column: Colorblock composition — four colored panels arranged in a 2×2 grid:
  - Top-left (Tomate red): Label "Découvrez" + formation icon
  - Top-right (Citron yellow): Label "Scannez" + QR icon
  - Bottom-left (Piscine blue): Label "Connectez" + network icon
  - Bottom-right (Menthe teal): Label "Matchez" + heart icon

**Stats Strip**
- 3 stats displayed horizontally: "700K visiteurs", "130 salons", "8 954 écoles"
- Each stat: Large bold number (Tomate) + descriptor text below

**Role Card Grid**
- 3 equal cards in a row: Étudiant (student), Enseignant (teacher), Parent
- Each card: Icon/glyph at top, role name heading, 2-sentence description, role-colored CTA button (Tomate, Piscine, Pourpre)

**Features Section**
- Dark background section (`Nuit`)
- `.le-section-label` eyebrow: "COMMENT ÇA MARCHE"
- 3-column grid, each column: number (01, 02, 03) in Tomate + heading + body text
- Columns: "Avant le salon" / "Pendant le salon" / "Après le salon"

**Footer**
- Dark background
- Logo (mono/white variant)
- 8-color rainbow stripe (`le-stripe-multi`) as a decorative row
- Links, copyright, legal

---

### Screen 2 — Login (`/(auth)/login`)

**Purpose**: Email/password authentication with role-based post-login redirect.

**Layout**: Two-column grid (collapses to single column on mobile)

**Top Bar**
- Logo (left) + "← Accueil" link (right)

**Left Column — Editorial Hero**
- Gradient italic `.le-h1` heading: "Bon retour" (large, stylized)
- List of 3 features with checkmark icons: "Recommandations personnalisées", "Prise de rendez-vous", "Accès à tous vos salons"
- Subtle color blobs / auth background gradient behind this panel

**Right Column — Form Card**
- White `le-surface` card, centered, max-width 420px
- Title: "Connexion" (`.le-h2`)
- Email input (with envelope icon prefix)
- Password input (with lock icon prefix + eye toggle)
- "Mot de passe oublié ?" right-aligned link in Piscine
- "Se connecter" primary button (full width)
- Error state: Red left-border alert box with icon and error message
- Divider: "Nouveau sur L'Étudiant ?"
- 4 role selector links at bottom row: 🎓 Étudiant / 📚 Enseignant / 🏫 Établissement / 👨‍👩‍👧 Parent — each in its role color

---

### Screen 3 — Student Home (`/(student)/home`)

**Purpose**: The student's daily dashboard — agenda, intent status, quick actions, upcoming events, school suggestions.

**Layout**: Single column, scrollable, mobile-first

**Top Header**
- Dark background (`Nuit` gradient)
- Greeting: "Salut, [Prénom] 👋" in `.le-h2` white
- Current date in `le-caption` gray
- Row of 6 small colored dots (the 6 brand colors) — decorative

**Next Fair Card**
- `.le-section-label`: "PROCHAIN SALON"
- Fair name + city + date
- Countdown badge (days remaining): Tomate gradient background, white text, rounded pill

**Intent Stage Nudge Card**
- Left-border color matching current stage (yellow/blue/red)
- Progress bar at top (colored per stage)
- Stage badge (OrientationBadge component)
- Short motivational message + CTA "Compléter mon profil" or contextual action

**Booth Visit Widget**
- Compact white card: bookmarks icon + "Mes visites de stands" + count badge + chevron

**Quick Actions Grid**
- 3 cards in a horizontal row:
  - Dossier (Tomate): document icon + label
  - Comparer (Piscine): comparison icon + label
  - Récap (Citron): sparkle/chart icon + label

**Services Bar**
- Horizontal scrollable row of small icon+label action buttons

**Upcoming Events**
- `.le-section-label`: "PROCHAINS SALONS"
- Vertical list of event cards: colored left-border strip, fair name, city + date, "Voir" button

**Suggested Schools Grid**
- `.le-section-label`: "POUR VOUS"
- 2×3 grid of school tiles (SchoolRecommendationsCard)
- Each tile: gradient background (unique per school) + large initial letter + school name + city

**Bottom Navigation**
- StudentBottomNav — fixed, 5 items

---

### Screen 4 — Discover — Swipe Tab (`/(student)/discover` → Swipe)

**Purpose**: Tinder-style swipe to like/skip educational formations.

**Layout**: Full screen, stacked cards, action buttons at bottom

**Header**
- "Découvrir" title + gray caption "Trouvez votre formation"
- 3 tab pills: **Swipe** | Reels | Actualités (active tab has red underline)
- Saved count red badge in top-right corner

**Card Stack**
- 2–3 cards stacked (slight scale + rotation on back cards)
- Active card fills ~70% of screen height
- **Card Front**:
  - Full-bleed gradient background (unique color combo per formation)
  - Large semi-transparent emoji watermark (bottom-right, ~80px)
  - Formation name: Large white italic bold text (~28–32px)
  - School name: Smaller white text below
  - City pill: Ghost white border pill
  - Domain tags: White semi-transparent pills
- **Card Back** (3D flip on tap):
  - Same gradient header strip (short)
  - White content area
  - Detail rows: Duration / Level / Modality / Admission / Cost

**Action Buttons Row**
- 3 circular buttons centered below card stack:
  - Left: ✕ (skip) — ghost gray border, gray icon, ~52px
  - Center: 💡 (interested) — gray border, bulb icon, slightly smaller
  - Right: ✓ (like) — Tomate fill, white checkmark, ~52px, red glow shadow
- Keyboard hints below: ← → arrows

**Toast Notification**
- Slides up from bottom: dark pill with emoji + message (e.g., "💾 Sauvegardé !")

**Empty State**
- 🎓 emoji (large)
- "Vous avez tout exploré !" heading
- Body text
- "Recommencer" ghost button

---

### Screen 5 — Discover — Reels Tab (`/(student)/discover` → Reels)

**Purpose**: Short school presentation videos, browsable like a reel feed.

**Layout**: Single column scroll

**Featured Reel Card**
- Large card (~200px height), full-bleed gradient bg
- School name + play button (white circle with triangle)
- Title / tags / duration badge (bottom-left)
- "Regarder" button (white ghost)

**Queue Grid**
- `.le-section-label`: "DANS LA QUEUE"
- 2-column grid of reel thumbnails
- Each: gradient bg + play icon + school name + duration badge

**Video Modal** (on play)
- Dark backdrop
- Left panel (2/3 width): Video player (black bg, centered play button, seek bar)
- Right panel (1/3 width): School name + formation title + description + tags + "Sauvegarder" button

---

### Screen 6 — Discover — Actualités Tab (`/(student)/discover` → Actualités)

**Purpose**: Personalized news articles from schools and L'Étudiant editorial.

**Layout**: Masonry grid (4 columns on wide, 2 on mobile)

**Personalization Note**
- Blue info box at top: ✨ icon + "Personnalisé pour vous" message

**Article Cards**
- Variable heights in masonry layout
- Image header: Gradient background (school/rubrique-specific color)
- Content area: `rubrique` colored tag + title + reading time + "Lire plus" link

**Article Modal** (on card click)
- Gradient header (full-bleed, ~160px) with title overlay
- "Sauvegarder" bookmark button (top-right)
- Close "×" button (top-right)
- Body: Article excerpt text
- CTA: "Lire l'article complet →" Tomate link

---

### Screen 7 — Schools Directory (`/(student)/schools`)

**Purpose**: Searchable, filterable list of all schools participating in fairs.

**Layout**: Single column, scrollable

**Header**
- Tomate red full-width header panel
- "Établissements" `.le-h1` in white
- Search input (transparent bg, white border, white placeholder text, search icon prefix)

**Filter Pills Row**
- Horizontal scrollable row below header
- Pill options: "Tous", "Université", "Grande École", "École de Commerce", "École d'Ingénieurs", "BTS/IUT", etc.
- Active pill: White background + Tomate text; inactive: ghost white outline

**Results Count**
- "X établissements" in gray-500, small

**School List**
- Each card (full-width, white bg, shadow-sm):
  - Left: Colored circle with school initials (or logo if available)
  - Center: School name (`.le-h3`) + city + school type in gray
  - Right: 3 badge pills in a row (e.g., "Parcoursup" blue, "Alternance" yellow, "Bourse" green) + chevron `›`

---

### Screen 8 — Fair Floor Plan (`/(student)/fair/[eventId]`)

**Purpose**: Interactive 2D map of a fair venue with clickable school stands.

**Layout**: Fixed-height map + scrollable side panel

**Page Header**
- Fair name + date + city
- Tab row: Plan | Conférences | Infos

**SVG Floor Plan**
- Beige/gray background rectangle
- Grid of colored stand blocks (50×36px each, category-colored fills)
- Gray vertical aisle strips with letter labels (A, B, C)
- "Conférences" green room (right side)
- "ENTRÉE" red/pink band (bottom)
- Stand labels: school abbreviation or number, white text, 9px

**Category Legend**
- Horizontal scrollable row of color pills: ■ label for each category color

**Stand Detail Panel** (appears when stand is tapped)
- Slides up from bottom (or right panel on wide screens)
- School logo/initials + school name + category badge
- Formation list (3–5 items, bullet points)
- "Sauvegarder" + "Itinéraire" action buttons

---

### Screen 9 — QR Scanner (`/(student)/fair/[eventId]/scan`)

**Purpose**: Student scans exhibitor booth QR codes to log a stand visit.

**Layout**: Full-screen camera view

**Scanner View**
- Full-bleed camera feed
- Scanning frame: Rounded square outline with corner brackets (white/Tomate)
- Status label beneath frame: "Pointez vers le QR du stand"
- Cancel button at bottom

**Success State**
- Green confirmation overlay: ✓ icon + school name + "Visite enregistrée !"
- Auto-dismisses after 2s

---

### Screen 10 — Student QR Code (`/(student)/qr`)

**Purpose**: Display the student's personal QR code for booth staff to scan.

**Layout**: Centered, minimal

**Card**
- White centered card, shadow-lg, radius-xl
- Student name + avatar initials at top
- Large QR code canvas (256×256px, black-and-white matrix, L'Étudiant logo center overlay)
- "Mon code QR" label below
- "Télécharger" ghost button (downloads PNG)

---

### Screen 11 — Saved Schools (`/(student)/saved`)

**Purpose**: Wishlist of saved schools and formations.

**Layout**: Tabbed (Écoles | Formations | Actualités)

**Tab Bar**
- 3 pills: Écoles / Formations / Actualités — active = Tomate underline

**Schools Tab**
- Same school card style as Schools Directory

**Formations Tab**
- Formation cards: gradient left strip (category color) + formation name + school + type badge + remove button

**Articles Tab**
- Article cards: small gradient thumbnail + title + rubrique tag + reading time

**Empty State**
- Bookmark icon (gray, large) + "Aucune sauvegarde" + CTA to Discover

---

### Screen 12 — Post-Fair Recap (`/(student)/recap/[eventId]`)

**Purpose**: Summary of stands visited, schools liked, and recommended next steps after attending a fair.

**Layout**: Single column, sectioned

**Header**
- Fair name + date + "Récapitulatif" label
- Stats row: X stands visités / X écoles likées / X rendez-vous

**Sections**
- Visited Stands: School card list with visit timestamp
- Liked Formations: Formation tiles with actions (Comparer, Voir fiche)
- Next Steps: Colored action cards (Complete profile, Book appointment, Compare shortlist)
- Insight Card: OrientationBadge + short AI-generated recommendation text

---

### Screen 13 — Teacher Dashboard (`/teacher/dashboard`)

**Purpose**: Manage a student group — invite members, track pre-fair prep, view roster.

**Layout**: Sidebar + main content (desktop) / full-page tabs (mobile)

**TeacherSideNav**
- Same style as AdminSideNav

**Header**
- Group name + school + "Créer un groupe" button (if none exists)

**Stats Row**
- 3 KPI cards: Total membres / % profil complété / % pré-inscrits
- Each: number (large, Piscine) + label + progress bar

**Tabs**
- Tab 1 — Préparer:
  - Checklist items (checkbox + label + status badge)
  - Invite section: Copy-link input + copy button, WhatsApp share button, Email share button
  - QR code canvas (for group invite)
- Tab 2 — Membres:
  - List of students with: avatar initials + name + joined date + "Profil" badge (green/gray) + "Pré-inscrit" badge (blue/gray)
  - Filter row: search + status filter

---

### Screen 14 — Exhibitor Dashboard (`/exhibitor/dashboard`)

**Purpose**: Real-time fair performance stats for a school's booth staff.

**Layout**: Sidebar + main content (desktop) / tabbed (mobile)

**ExhibitorSideNav**
- Same structure as AdminSideNav with exhibitor-specific links

**Event Selector**
- Dropdown: "Salon en cours: [Fair Name]"

**KPI Cards Row**
- 4 cards in a row:
  - Total scans (Tomate accent bar)
  - Aujourd'hui scans (Piscine accent bar)
  - Swipe droits (Citron accent bar)
  - Rendez-vous (Menthe accent bar)
- Each: large number (28px) + label + optional trend arrow

**Intent Distribution**
- 3 horizontal progress bars:
  - "Explorent": Yellow bar + percentage
  - "Comparent": Blue bar + percentage
  - "Décident": Red bar + percentage

**Top Branches**
- Vertical list of 4–6 formation branches
- Each: label + horizontal progress bar (Piscine) + percentage

**Booth QR**
- "Générer mon QR de stand" section
- Canvas (128×128px QR code) + "Télécharger" button

**Live Leads List**
- Table: Avatar initials | Student name | Email | Scan time | Intent badge
- "Voir tous les leads" CTA link

---

### Screen 15 — Booth Capture (`/booth/capture`)

**Purpose**: Simplified interface for booth staff to manually capture a student lead (no QR scanner available).

**Layout**: Full-page form, minimal UI

**Header**
- School name + "Capture de lead" label

**Form**
- Student first name + last name inputs
- Email input
- Phone (optional) input
- Orientation stage selector: 3 large buttons — Explore / Compare / Décide (styled as toggle group)
- Branch checkboxes: List of formation branches offered
- Submit button: "Enregistrer le contact" (full-width Tomate primary)

**Success State**
- Green check animation + "Contact enregistré !" + "Nouveau contact" ghost button

---

### Screen 16 — Admin Dashboard (`/admin/dashboard`)

**Purpose**: Aggregate analytics for event organizers — student clustering, intent heatmaps, strategy recommendations.

**Layout**: Sidebar + tabbed main content

**AdminSideNav**
- Dark sidebar (see §4.1)

**5-Tab Interface**
- Tabs: Préparation | Jour-J | Bilan | Clusters | Stratégie

**Tab: Préparation**
- Checklist cards with emoji + status badge
- Exhibitor count + registration stats

**Tab: Jour-J**
- Live attendance counter (large number, animated pulse dot)
- Area chart (Recharts): Student arrivals over time (x=hour, y=count, Tomate color)
- Intent breakdown: 3 horizontal progress bars
- Live scans feed: Scrolling list of recent scan events

**Tab: Bilan**
- KPI summary cards grid
- Top schools by scans (ranked list)
- Student satisfaction metric

**Tab: Clusters**
- Segmentation visualization: 3 colored cluster cards (Explorer/Comparer/Décider)
- Each: count, % of total, top schools for this cluster, recommended action

**Tab: Stratégie**
- AI-generated recommendation cards: Quote-style text block with colored left bar
- Actionable insight bullets: each with emoji icon prefix

---

### Screen 17 — Admin Students (`/admin/students`)

**Purpose**: View and manage all student accounts.

**Layout**: Table view with sidebar filters

**Search + Filter Bar**
- Search input + "Filtrer" button + bulk action dropdown

**Students Table**
- Columns: Checkbox | Name | Email | Intent stage badge | Last active | Fair attended | Actions
- Row hover: Light gray bg
- Pagination: Page numbers + arrows at bottom

**Student Detail (`/admin/students/[id]`)**
- Profile card: Avatar + name + email + phone + registration date
- Intent history: Timeline of stage changes
- Saved schools: Grid of school pills
- Scan history: Table of booth visits

---

### Screen 18 — Onboarding (`/onboarding`)

**Purpose**: Role-based profile setup flow for new users.

**Layout**: Multi-step wizard, centered, minimal

**Step Indicator**
- Row of dots (or numbered pills): active = Tomate, completed = green, upcoming = gray

**Step 1 — Role confirmation**
- 4 large role cards (Étudiant / Enseignant / Parent / Établissement)
- Role card selected state: Tomate border + light red bg

**Step 2 — Personal info** (student)
- First name, last name, date of birth, city inputs

**Step 3 — Orientation profile**
- "Quelle est ta situation ?" — current education level selector (pills)
- "Quels domaines t'intéressent ?" — multi-select domain chips (colored pills, toggleable)

**Step 4 — Fair selection**
- List of upcoming fairs with date + city + "Participer" toggle

**Final screen**
- Large ✓ icon (Menthe green)
- "Profil créé !" heading
- "Accéder à mon espace" primary button

---

### Screen 19 — 404 Not Found (`/not-found`)

**Purpose**: Friendly error page for broken links.

**Layout**: Centered, minimal

- Large "404" in `.le-display` (Tomate)
- "Page introuvable" heading
- Short explanation text
- "← Retour à l'accueil" ghost button
- 3-color stripe decorative bar below

---

## Appendix A — Role Color Mapping

| Role | Color | Hex |
|------|-------|-----|
| Student | Tomate | `#EC1F27` |
| Teacher | Piscine | `#0066CC` |
| Parent | Pourpre | `#932D99` |
| Exhibitor / School | Spirit | `#FF6B35` |
| Admin | Nuit | `#2B1B4D` |

---

## Appendix B — Key Interaction Patterns

| Pattern | Description |
|---------|-------------|
| Swipe gesture | Left = skip, Right = like (react-tinder-card) |
| Card flip | Tap formation card to flip 3D (rotateY 180°) |
| Bottom sheet | Stand detail, article modal slide up from bottom |
| Tab switch | Underline transitions with 0.2s ease |
| Hover lift | Cards rise `translateY(-2px)` to `translateY(-4px)` on hover |
| QR scan | Camera overlay with animated corner brackets |
| Toast | Slides up from bottom, auto-dismisses 3s |
| Skeleton load | Gray shimmer placeholder while data loads |

---

## Appendix C — Screen Size Targets

- **Primary target**: Mobile phone portrait (390–430px wide)
- **Secondary**: Tablet (768–1024px) — used for teacher/admin dashboards
- **Tertiary**: Desktop (1280px+) — admin/exhibitor dashboards with sidebar
- Admin and exhibitor interfaces are desktop-first; student and teacher are mobile-first
