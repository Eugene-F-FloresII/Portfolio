# Portfolio CSS Changes Guide (Beginner-Friendly)

This guide explains every layout and styling update made to your portfolio so you can learn the responsive CSS patterns and reuse them later.

## Quick Highlights (Read This First)

- [IMPORTANT] `main { max-width: 1200px; margin: 0 auto; }` is the core centering rule for desktop.
- [IMPORTANT] `height: auto` on mobile cards prevents cramped content and uneven sections.
- [IMPORTANT] `flex-wrap: wrap` lets rows stack naturally when screen width gets smaller.
- [IMPORTANT] Use classes (like `.header-button`) for repeated elements, not duplicate IDs.
- [IMPORTANT] Keep `prefers-reduced-motion` so fade animations remain accessibility-friendly.
- [IMPORTANT] The projects list now uses JS to show exactly 5 cards before scrolling.
- [TWEAK FAST] To tighten layout quickly, edit `gap` values first before changing structure.

## What Was Fixed

1. Desktop spacing felt uneven with too much open space on the right side.
2. Header and body layout looked uneven on phones.
3. There was no entry transition when opening the website.
4. The projects list could grow too long and push the page too much.

---

## 1) Centering the layout on large screens

### Problem
Your sections were anchored to the left using `justify-content: flex-start`, and some cards had manual left offsets (`margin-left: 50px`).

### Fix

- Added a centered container for all page content:
  - `main { max-width: 1200px; margin: 0 auto; }`
- Updated section rows (`.main-first`, `.main-second`, `.main-third`) to:
  - `justify-content: center`
  - `flex-wrap: wrap`
  - a cleaner, consistent gap
- Removed manual left-push margins on main cards.

### Why it works
`max-width` prevents super-wide stretching, and `margin: 0 auto` centers the whole content block. Centered flex rows keep bordered cards balanced on both sides.

### Keep in mind
- [IMPORTANT] If desktop looks too wide again, check `max-width` first.
- [IMPORTANT] If cards hug one side, check `justify-content` and any manual margins.

---

## 2) Making the header and body responsive for phones

### Header improvements

#### Problem
- Header spacing relied on hard-coded margins.
- Buttons used duplicate IDs (`id="Resume"` repeated), which is invalid HTML.

#### Fix
- Replaced duplicate button IDs with a reusable class: `.header-button`.
- Renamed buttons to distinct labels:
  - Resume
  - Projects
  - Contact
- Converted header groups into flexible rows that wrap naturally.
- Added tablet and mobile rules so title, buttons, and icons align evenly.
- Added a follow-up header spacing pass to prevent large vertical gaps on tablet/mobile by:
  - reducing row gap in `.header-title`
  - stopping header groups from flex-growing (`flex: 0 0 auto`)
  - keeping mobile header groups at `width: auto` so they stay compact

#### Why it works
Classes are reusable and valid for multiple elements. Flex wrapping and mobile breakpoints let components reflow instead of overlapping or looking uneven.
The compact spacing pass prevents controls from being pushed far apart when the header stacks.

#### Keep in mind
- [IMPORTANT] Duplicate IDs can cause unexpected styling and JS behavior.
- [IMPORTANT] On stacked layouts, avoid `flex-grow` unless you intentionally want large spacing.

### Body/card improvements

#### Problem
- Several cards used fixed heights and strict minimum widths.
- On smaller devices this can create cramped content, uneven spacing, and overflow.

#### Fix
- Standardized card sizing with responsive flex values.
- On mobile (`max-width: 768px`), switched major cards to `height: auto` so content defines the height.
- Relaxed strict `min-width` behavior at smaller breakpoints.
- Adjusted text/image sizing and spacing for smaller screens.
- Improved stacking for intro section and list sections.

#### Why it works
Responsive layouts should prioritize fluid sizing. `height: auto` on mobile avoids clipping, and smaller spacing/font rules keep content readable and balanced.

#### Keep in mind
- [IMPORTANT] Fixed heights are okay for desktop sections, but usually risky on mobile.
- [IMPORTANT] Strict `min-width` values can break small-screen layouts.

---

## 3) Adding a simple fade-in on page load

### Problem
The page appeared instantly without transition.

### Fix
- Added a keyframe animation to the `body`:
  - starts at `opacity: 0`
  - ends at `opacity: 1`
  - duration: `0.7s`
- Added reduced-motion support:
  - `@media (prefers-reduced-motion: reduce)` disables animation and transitions.

### Why it works
Fade-in adds a gentle first impression. Reduced-motion support keeps the experience accessible for users sensitive to motion.

### Keep in mind
- [IMPORTANT] Always pair animation with reduced-motion support.
- [TIP] Keep first-load transitions short (`0.5s` to `0.8s`) so the site still feels snappy.

---

## 4) Limiting project cards to 5 visible items with scroll

### Problem
Project cards use different text lengths and image heights, so a CSS-only fixed height cannot always show exactly 5 full cards before scrolling.

### Fix
- Added a JS file: `Scripts/JS/projects-scroll.js`.
- The script measures the first 5 `.Projects-list` cards and sets `max-height` on `.Projects-border-list`.
- Kept scrolling enabled with `overflow-y: auto` in `Scripts/CSS/main.css`.
- Loaded the script in `index.html` before `</body>`.

### Why it works
Because card heights are measured at runtime, the list always shows exactly 5 full cards first. If there are more, the user can scroll to see the rest.

### Keep in mind
- [IMPORTANT] Change `MAX_VISIBLE_PROJECTS` in `Scripts/JS/projects-scroll.js` if you want a different visible card count.
- [IMPORTANT] The script recalculates on page load and resize, so it stays accurate across screen sizes.

---

## File-by-file changes

### `index.html`
- Updated header buttons from duplicate IDs to class-based buttons.
- Changed labels to `Resume`, `Projects`, and `Contact`.
- Added `<script src="Scripts/JS/projects-scroll.js"></script>` so project list height is computed automatically.

### `Scripts/CSS/header.css`
- Added page fade-in animation and keyframes.
- Centered header container with max width.
- Refactored button styling from `#Resume` to `.header-button`.
- Improved responsive behavior for tablet and mobile.
- Tightened stacked header spacing to remove excessive vertical space.
- Added reduced-motion fallback.

### `Scripts/CSS/main.css`
- Added centered main container with max width.
- Centered row layouts and standardized spacing.
- Removed manual left offsets from bordered cards.
- Improved card width behavior for large screens.
- Added responsive breakpoints for tablet/phone.
- Switched card heights to `auto` on mobile.
- Enabled vertical scrolling in `.Projects-border-list` (`overflow-y: auto`).

### `Scripts/JS/projects-scroll.js`
- Added runtime height calculation for `.Projects-border-list`.
- Shows exactly 5 project cards first, then scrolls for additional cards.
- Recalculates on `DOMContentLoaded`, `load`, and `resize`.

---

## Quick CSS Concepts You Just Used

- [IMPORTANT] `max-width` + `margin: 0 auto` = centered content block on large screens.
- [IMPORTANT] `display: flex` + `flex-wrap: wrap` = responsive row that can stack naturally.
- [IMPORTANT] `flex: 1 1 320px` = grow and shrink, with a preferred base width.
- [IMPORTANT] Media queries (`@media`) = apply rules only for certain viewport widths.
- [IMPORTANT] `height: auto` = let content control the box height.
- `@keyframes` + `animation` = create entry transitions.
- `prefers-reduced-motion` = accessibility-friendly motion handling.
- JS measurement + `max-height` = exact visible card count with variable content.

---

## How to tweak this later (safe edits)

If you want to customize the look further:

1. Wider/narrower desktop content:
   - edit `main { max-width: 1200px; }` in `Scripts/CSS/main.css`.
2. More/less spacing between cards:
   - edit `gap` in `.main-first`, `.main-second`, `.main-third`.
3. Faster/slower fade-in:
   - edit `animation: pageFadeIn 0.7s ...` in `Scripts/CSS/header.css`.
4. Earlier/later phone layout switch:
   - adjust values in media queries (`900px`, `768px`, `480px`).
5. Tighter/looser stacked header spacing:
   - adjust `.header-title { gap: ... }` and the tablet/mobile `flex` rules in `Scripts/CSS/header.css`.
6. More/less project cards visible before scrolling:
   - edit `MAX_VISIBLE_PROJECTS` in `Scripts/JS/projects-scroll.js`.

---

## Final outcome

You now have:
- A centered, balanced desktop layout.
- A cleaner and more even phone/tablet layout.
- A simple and accessible page-entry fade-in.
- A projects list that shows 5 cards first, then scrolls for more.

These are core responsive CSS patterns used in real-world production websites.
