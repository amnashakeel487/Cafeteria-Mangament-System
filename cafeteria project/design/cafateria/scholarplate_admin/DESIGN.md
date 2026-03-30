# Design System Strategy: The Culinary Architect

## 1. Overview & Creative North Star
The "Culinary Architect" strategy moves away from the cold, clinical nature of standard database management and toward a high-end, editorial experience. In a university environment, information must be parsed rapidly but with an air of authority and precision.

**Creative North Star: The Obsidian Kitchen.** 
Imagine a high-end chef’s kitchen at midnight: dark, polished surfaces, precision tools, and a single, intense flame. This design system uses the **#1E1E2F (Surface Container)** as our polished stone and the **#FF6B35 (Primary)** as the heat. We break the "template" look by using a "Modular Asymmetry" approach—where stat cards and data visualizations aren't just boxes, but layered depths of information that feel carved into the interface rather than pasted onto it.

---

## 2. Colors & Surface Philosophy
We are moving beyond "flat" dark mode. We use tonal shifts to guide the eye, not lines.

- **The "No-Line" Rule:** 1px solid borders are strictly prohibited for layout sectioning. Separation is achieved through background shifts. For example, the Sidebar sits on `surface_container_low` (#1A1A2B) while the main content area utilizes the base `background` (#121222).
- **Surface Hierarchy & Nesting:**
    - **Base Layer:** `surface` (#121222) for the canvas.
    - **Intermediate Layer:** `surface_container` (#1E1E2F) for the main dashboard body.
    - **Elevation Layer:** `surface_container_high` (#28283A) for cards and interactive modules.
- **The "Glass & Gradient" Rule:** Use `surface_bright` (#38374A) at 40% opacity with a `20px` backdrop-blur for floating modals or dropdowns. 
- **Signature Accents:** For primary actions, do not use a flat hex. Apply a subtle linear gradient: `primary` (#FFB59D) to `primary_container` (#FF6B35) at a 135-degree angle. This gives buttons a "lit from within" glow.

---

## 3. Typography: The Editorial Edge
We pair the geometric precision of **Manrope** for data and headers with the high-legibility of **Inter** for functional UI.

- **Display & Headlines (Manrope):** These are your "Anchors." Use `display-sm` (2.25rem) for daily revenue totals. The wide apertures of Manrope feel modern and institutional.
- **Titles & Labels (Inter):** Use `title-sm` (1rem) for card headers. Always use `letter-spacing: 0.02em` on `label-md` to ensure that even at small sizes, cafeteria inventory items are perfectly legible.
- **Hierarchy through Contrast:** Use `on_surface` (#E3E0F8) for primary data and `on_surface_variant` (#E1BFB5) for metadata (like timestamps or unit counts). This 20% drop in contrast creates an immediate visual priority.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows are too "web 2.0" for this system. We use "Ambient Occlusion" logic.

- **The Layering Principle:** To highlight a "Today’s Special" card, do not add a border. Place the `surface_container_highest` (#333345) card on top of the `surface_container` (#1E1E2F) background. The subtle shift in lightness provides all the "lift" required.
- **Ambient Shadows:** For floating elements (Notifications, Profile Menu), use a very large, soft shadow: `offset-y: 24px`, `blur: 48px`, `color: rgba(12, 12, 29, 0.5)`. This mimics the way light behaves in a dimly lit room.
- **The "Ghost Border" Fallback:** If a data table requires internal separation, use `outline_variant` (#594139) at **15% opacity**. It should be felt, not seen.

---

## 5. Components & Interface Primitives

### Sidebar Navigation
- **Architecture:** `surface_container_low` background. 
- **Active State:** No thick bar on the left. Instead, use a "Glow Capsule"—a `primary_container` background with a 15% opacity, and the icon/text switched to `primary_fixed`.
- **Hover:** A subtle shift to `surface_bright` at 10% opacity.

### Stat Cards (The Data Pillars)
- **Background:** `surface_container_high` (#28283A).
- **Radius:** `xl` (0.75rem).
- **Data Viz Integration:** Sparklines (mini-graphs) should use the `tertiary` (#59D5FB) color to provide a "cool" counter-balance to the "warm" orange primary accent.

### Data Tables (Inventory & Transactions)
- **Rule:** Forbid divider lines between rows. 
- **Structure:** Use `spacing-4` (1rem) vertical padding per row. On hover, the entire row should transition to `surface_container_highest` (#333345) with a `md` (0.375rem) corner radius, making the row feel like a selectable "object."

### Buttons
- **Primary:** Gradient fill (Primary to Primary Container). Text: `on_primary` (#5D1900). Radius: `lg` (0.5rem).
- **Tertiary (Ghost):** No background. `primary` text color. On hover, add a `primary_container` at 10% opacity.

### Input Fields
- **Style:** "In-set" look. Use `surface_container_lowest` (#0C0C1D) with a `sm` radius. 
- **Focus:** Transition the "Ghost Border" from 15% to 60% opacity using the `primary` token.

---

## 6. Do’s and Don’ts

### Do:
- **Use "Breathing Room":** Use `spacing-10` (2.5rem) between major dashboard modules. High-end design requires negative space.
- **Use Intentional Asymmetry:** If you have three stat cards and one large chart, don't force them into equal widths. Let the chart breathe across 66% of the screen.
- **Color Coding by Temperature:** Use `primary` (Orange/Warm) for actions/revenue and `tertiary` (Blue/Cool) for logistics/inventory.

### Don't:
- **Don't use pure black (#000):** It kills the "Obsidian" depth. Always stick to the `surface_container_lowest` for your darkest points.
- **Don't use 100% Opaque Borders:** This creates a "grid-trap" visual fatigue for admin users who spend 8 hours a day in the system.
- **Don't use standard "Alert Red":** Use our `error` (#FFB4AB) and `error_container` (#93000A) tokens. They are tuned to be visible against the dark background without causing eye strain.