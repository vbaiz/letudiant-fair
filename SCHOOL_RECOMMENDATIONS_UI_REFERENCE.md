# School Recommendations — UI/UX Reference

## Booth Form V2 — Visual Flow

```
┌─────────────────────────────────────────────┐
│         BOOTH CAPTURE FORM V2               │
│         📱 Capture d'Orientation            │
├─────────────────────────────────────────────┤
│                                             │
│  Step 1 of 4: 1️⃣ ORIENTATION              │
│  ═══════════════════════════════════════   │
│                                             │
│  Où en es-tu dans ton projet ?             │
│  ○ 🔵 J'explore les possibilités         │
│  ○ 🟡 Je compare les options              │
│  ○ 🟢 Je suis en train de décider         │
│                                             │
│  En quelle classe es-tu cette année ?      │
│  ┌────────────────────────────────────┐   │
│  │ Sélectionne...  ▼                  │   │
│  └────────────────────────────────────┘   │
│                                             │
│  Quels domaines t'intéressent ?            │
│  ☐ Ingénierie      ☐ Commerce              │
│  ☐ Informatique    ☐ Droit                 │
│  ☐ Santé           ☐ Sciences              │
│                                             │
│                ┌──────────────┐             │
│                │ Suivant →    │             │
│                └──────────────┘             │
│                                             │
└─────────────────────────────────────────────┘
                       ↓

┌─────────────────────────────────────────────┐
│  Step 2 of 4: 2️⃣ PERFORMANCE              │
│  ═══════════════════════════════════════   │
│                                             │
│  Quelle est ta moyenne académique ?        │
│  (Échelle 0-20)                            │
│                                             │
│  │ ━━━━━━━━━━━━━━○━━━━━━━━│      │15      │
│  0              20          │   Très Bon   │
│                                             │
│  ┌──────────────────┬──────────────────┐   │
│  │ ← Retour         │ Suivant →        │   │
│  └──────────────────┴──────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
                       ↓

┌─────────────────────────────────────────────┐
│  Step 3 of 4: 3️⃣ SPÉCIALISATION          │
│  ═══════════════════════════════════════   │
│                                             │
│  Tes spécialités Bac : (optionnel)         │
│                                             │
│  ☑ Maths                 ☐ Littérature    │
│  ☑ Physique-Chimie       ☐ Philosophie    │
│  ☐ SVT                   ☐ Autre           │
│                                             │
│  ┌──────────────────┬──────────────────┐   │
│  │ ← Retour         │ Suivant →        │   │
│  └──────────────────┴──────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
                       ↓

┌─────────────────────────────────────────────┐
│  Step 4 of 4: 4️⃣ COORDONNÉES             │
│  ═══════════════════════════════════════   │
│                                             │
│  Écoles d'intérêt (nom libre) :            │
│  ┌────────────────────────────────────┐    │
│  │ Ex: Télécom Paris, HEC, ...        │    │
│  └────────────────────────────────────┘    │
│                                             │
│  Pouvons-nous te contacter ? (optionnel)   │
│  ☑ Oui, j'accepte le contact              │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ Email                              │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ Téléphone                          │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌──────────────────┬──────────────────┐   │
│  │ ← Retour         │ ✅ Enregistrer   │   │
│  └──────────────────┴──────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
                       ↓
                  [API Call]
                       ↓

┌─────────────────────────────────────────────┐
│  ✅ RECOMMANDATIONS                        │
│  ═══════════════════════════════════════   │
│                                             │
│  Top 3 écoles adaptées à ton profil       │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ #1 ÉCOLE POLYTECHNIQUE     82% 🟢  │   │
│  │ ─────────────────────────────────  │   │
│  │ Strong domain match + Meets         │   │
│  │ academic requirements              │   │
│  │                                    │   │
│  │ Niveau: 100% │ Domaines: 85% │    │   │
│  │ Academic: 80% │ Spéc: 70%     │   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ #2 TÉLÉCOM PARIS           71% 🟢  │   │
│  │ ─────────────────────────────────  │   │
│  │ Strong domain match                │   │
│  │                                    │   │
│  │ Niveau: 100% │ Domaines: 75% │    │   │
│  │ Academic: 70% │ Spéc: 50%     │   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ #3 HEC PARIS               55% 🟡  │   │
│  │ ─────────────────────────────────  │   │
│  │ Moderate domain match              │   │
│  │                                    │   │
│  │ Niveau: 100% │ Domaines: 40% │    │   │
│  │ Academic: 60% │ Spéc: 0%      │   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  💾 Données enregistrées pour suivi        │
│  post-salon                                │
│                                             │
│  Redémarrage automatique dans...           │
│                                             │
│  ┌──────────────────────────────────┐    │
│  │ ↻ Nouveau Scan                   │    │
│  └──────────────────────────────────┘    │
│                                             │
│  [Auto-resets to Step 1 after 5s]         │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Post-Fair App Display

```
┌──────────────────────────────────────────────────────────┐
│  ÉCOLES RECOMMANDÉES                                     │
│                                                          │
│  Basé sur Terminale • Note: 15/20 • Domaines:           │
│  Ingénierie, Informatique                               │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🟢 1. ÉCOLE POLYTECHNIQUE                  82%    │  │
│  │                                                    │  │
│  │ Pourquoi: Strong domain match + Meets academic   │  │
│  │ requirements + Bac specialty alignment            │  │
│  │                                                    │  │
│  │ ┌──────────────┬──────────────┬──────────────┐   │  │
│  │ │ NIVEAU       │ DOMAINES     │ ACADÉMIQUE   │   │  │
│  │ │ 100%         │ 85%          │ 80%          │   │  │
│  │ ├──────────────┼──────────────┼──────────────┤   │  │
│  │ │ SPÉCIALISA.  │              │              │   │  │
│  │ │ 70%          │              │              │   │  │
│  │ └──────────────┴──────────────┴──────────────┘   │  │
│  │                                                    │  │
│  │           ┌─────────────────────┐                │  │
│  │           │ En savoir plus →    │                │  │
│  │           └─────────────────────┘                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🟢 2. TÉLÉCOM PARIS                        71%    │  │
│  │                                                    │  │
│  │ Pourquoi: Strong domain match                    │  │
│  │                                                    │  │
│  │ ┌──────────────┬──────────────┬──────────────┐   │  │
│  │ │ NIVEAU: 100% │ DOMAINES: 75%│ ACADÉMIQUE:70%   │  │
│  │ │ SPÉCIAL: 50% │              │              │   │  │
│  │ └──────────────┴──────────────┴──────────────┘   │  │
│  │                                                    │  │
│  │           ┌─────────────────────┐                │  │
│  │           │ En savoir plus →    │                │  │
│  │           └─────────────────────┘                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🟡 3. HEC PARIS                           55%    │  │
│  │                                                    │  │
│  │ Pourquoi: À explorer                            │  │
│  │                                                    │  │
│  │ ┌──────────────┬──────────────┬──────────────┐   │  │
│  │ │ NIVEAU: 100% │ DOMAINES: 40%│ ACADÉMIQUE:60%   │  │
│  │ │ SPÉCIAL: 0%  │              │              │   │  │
│  │ └──────────────┴──────────────┴──────────────┘   │  │
│  │                                                    │  │
│  │           ┌─────────────────────┐                │  │
│  │           │ En savoir plus →    │                │  │
│  │           └─────────────────────┘                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  💡 Comment cette note est calculée:                   │
│     • 35% : Alignement avec ton niveau d'études        │
│     • 25% : Correspondance avec tes domaines           │
│     • 20% : Compatibilité académique (notes)           │
│     • 10% : Alignement avec ta spécialisation Bac      │
│     • 10% : Préférences mentionnées                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Color Reference

### L'Étudiant Brand Colors (from charte graphique)

```
Primary Red:       #E3001B
Secondary Blue:    #003C8F
Tertiary Yellow:   #FFD100

Tier Badges:
🟢 Strong:         #10B981 (green)
🟡 Moderate:       #F59E0B (amber)
🔴 Exploratory:    #EF4444 (red)

Background:
Light:             #F4F4F4
White:             #FFFFFF

Text:
Dark:              #1A1A1A
Medium:            #3D3D3D
Light:             #6B6B6B
```

---

## Responsive Design

### Mobile (375px - phone)
```
Form fits full width
Buttons stack vertically
Component cards single column
Slider works on touch
```

### Tablet (768px - booth)
```
Form width: 480px centered
Buttons: side-by-side
Recommendation cards: 1 column (optimized for reading on tablet)
Large text for quick reading by staff
```

### Desktop (1280px - app)
```
Max width: 800px
Cards: responsive grid
Component scores: 4-column grid
Full comparison view available
```

---

## Interaction States

### Form Inputs
```
DEFAULT:   border-color: #E8E8E8
HOVER:     border-color: #E3001B (subtle highlight)
FOCUS:     border-color: #E3001B, box-shadow glow
DISABLED:  opacity: 0.6
```

### Buttons
```
PRIMARY (Red):
  DEFAULT:   background: #E3001B
  HOVER:     background: #B0001A (darker)
  ACTIVE:    transform: scale(0.98)
  DISABLED:  background: #ccc

SECONDARY (Blue):
  DEFAULT:   color: #003C8F, border: #003C8F
  HOVER:     background: #003C8F, color: white
  
GHOST (Neutral):
  DEFAULT:   color: #6B6B6B
  HOVER:     background: #F4F4F4
```

---

## Loading & Error States

### Loading
```
Form submit button:
  "Calcul..." (in progress)
  opacity: reduced
  cursor: not-allowed

Component display:
  <p>Calcul des recommandations en cours...</p>
  (gray skeleton cards showing)
```

### Error
```
┌──────────────────────────────────────────┐
│ 🔴 ERREUR                               │
├──────────────────────────────────────────┤
│ Impossible de sauvegarder. Vérifie:     │
│ • Connexion Internet                    │
│ • Les informations saisies              │
│ • Réessaye                              │
└──────────────────────────────────────────┘

Background: #FEE2E2 (light red)
Border: #FCA5A5 (red)
Text: #991B1B (dark red)
```

### Success
```
Background: #ECFDF5 (light green)
Border: #10B981 (green)
Text: #059669 (dark green)
Icon: ✅
```

---

## Typography

### Headings (DM Sans)
```
H1: 42px weight 700 letter-spacing -1px     (main title)
H2: 26px weight 700 letter-spacing -0.5px   (section title)
H3: 18px weight 700                         (subsection)
```

### Body Text (DM Sans)
```
Regular:  15px weight 400 color #3D3D3D
Caption:  12px weight 500 UPPERCASE color #6B6B6B
```

### Monospace (for grades, scores)
```
Numeric display: 18px weight 700 color #E3001B
```

---

## Accessibility Notes

✅ **Keyboard Navigation**
- Tab through inputs
- Enter submits form
- Space toggles checkboxes

✅ **Screen Reader**
- All labels associated with inputs
- Form sections use heading hierarchy (H1 → H2 → H3)
- Tier emojis have alt text (e.g., "Strong fit")

✅ **Color Contrast**
- All text ≥ 4.5:1 WCAG AA
- Tier badges: emoji + text (not color-only)

✅ **Responsive**
- Mobile: touch targets ≥ 44px
- Tablet: readable at distance (booth use)

---

## Animation & Transitions

### Smooth Transitions
```css
/* Buttons */
transition: all 0.2s ease-in-out

/* Form progress */
transition: opacity 0.3s ease-in

/* Success screen */
slide-in-up 0.4s ease-out
```

### Auto-Reset
```
After success screen displayed:
- Countdown timer visible: "Redémarrage dans 5s"
- Automatically returns to Step 1
- Form fields cleared
- Ready for next scan
```

---

## Booth Display Tips

### For Staff

**Before Student Arrives:**
- Have form open at step 1
- Test QR code is scanned correctly
- Tablet brightness set high
- Internet connection confirmed

**During Capture:**
- Read questions aloud to student
- Help with grade slider (0-20 scale explanation)
- Note which schools student is interested in

**After Recommendations:**
- Show top 3 schools to student on screen
- Optional: take screenshot for student to reference
- Optional: print top 3 (if printer available at booth)
- Click "↻ Nouveau Scan" to reset for next student

### Timing
```
Q1 (Orientation):     15 seconds
Q2 (Grade slider):    10 seconds
Q3 (Specialty):       10 seconds
Q4 (Preferences):     10 seconds
─────────────────────────────
Algorithm + Display:  5 seconds
─────────────────────────────
Total per student:    50 seconds
```

---

## A/B Testing Ideas (Future)

- [ ] Different tier emoji styles (stars vs. colors)
- [ ] Card layout: vertical vs. horizontal compare
- [ ] Reason text: technical explanation vs. simple
- [ ] Grade scale: slider vs. dropdown vs. buttons
- [ ] Auto-reset timer: 5s vs. 10s vs. manual

---

## Accessibility Checklist

- [x] Color not sole indicator (emoji + color + text)
- [x] 4.5:1 contrast ratio on all text
- [x] Keyboard navigation supported
- [x] Form labels properly associated
- [x] Heading hierarchy correct
- [x] Touch targets ≥ 44px on mobile
- [x] Screen reader friendly
- [x] Loading states indicated
- [x] Error messages clear
- [x] Success feedback visible

---

**Status:** UI/UX specifications complete ✅
