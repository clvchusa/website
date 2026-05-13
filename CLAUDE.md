# CLVCH Website — Developer Reference

This is a vanilla HTML/CSS/JS **clickable prototype** for CLVCH, a multi-city luxury hospitality brand (restaurant + sports bar + nightclub). The prototype demonstrates look, content, and interactions; the production build targets **Next.js 15 + React 18 + Postgres**.

See [README.md](README.md) for full architecture rationale, design token reference, data model, and 9-step build order.

---

## Running the Prototype

No build step. Open `source/index.html` directly in a browser.

**Reset all state:**
DevTools → Application → Local Storage → delete all `clvch_*` keys, then reload.

**Enable admin mode:**
```js
localStorage.setItem('clvch_admin_role', 'super')
```
Then navigate to `#/admin`. Use `'manager:atlanta'` (or any city id) for scoped manager access.

**Keyboard shortcut:** `Shift+A` from any public page jumps to `#/admin`.

---

## File Map

```
source/
  index.html   — page shell: nav, modals, route outlet (#outlet)
  app.js       — window.CLVCH namespace, seed data, localStorage helpers, event dispatch
  routes.js    — page renderers for every hash route + all admin forms
  styles.css   — full design system (CSS custom properties + all component styles)
  assets/      — 4 logo variants (PNG) + 4 placeholder photography JPGs (~10 MB total)
SCHEMA.sql     — target Postgres schema (cities, gameday, home_content, staff_roles, audit_log)
README.md      — full architecture doc, design tokens, build order, open questions
screenshots/   — 7 PNGs showing rendered pages
```

---

## localStorage Keys

| Key | Type | Purpose |
|---|---|---|
| `clvch_locations` | `CityRecord[]` | Hydrates `window.CLVCH.locations` on boot |
| `clvch_home` | `HomeContent` | Single JSONB-like home content object |
| `clvch_gameday` | `{ [cityId]: GamedayMeta }` | Per-city gameday poster data |
| `clvch_admin_role` | `"super" \| "manager:<cityId>"` | Simulates auth role |
| `clvch_gate_seen` | `{ [cityId]: true }` | City-gate dismissal per session |
| `clvch_email` | `string` | Email captured at city-gate modal |

---

## Data Shapes (TypeScript)

```ts
type CityRecord = {
  id: string;           // kebab slug — derived from city name (see Slug Derivation below)
  city: string;
  state: string;
  status: 'open' | 'prep' | 'soon';
  disabled?: boolean;   // soft-delete; hidden from public routes
  count: number;        // tonight's attendance count
  tonight: string;
  tonightTime: string;
  address: string;
  phone: string;
  hours: string;
  capacity: number;
  opened: number;       // year opened
  hero: string;         // image URL
  blurb: string;
  marqueeWords: string[];
  coords: { x: number; y: number }; // SVG map pin, 0–100 range
};

type HomeContent = {
  hero: {
    chapter: string; estLine: string;
    word1: string; word2: string; word3: string;
    subModes: string[];
    blurb: string;      // may contain <em> HTML tags
    videoSrc: string;
  };
  pillars: {
    headline: string; intro: string;
    items: {
      num: string; title: string; copy: string;
      listLabel: string; listItems: string[]; image: string;
    }[];
  };
  marqueeWords: string[];
  pressLogos: string[];
  reserveStrip: { eyebrow: string; headline: string; sub: string; ctaTitle: string; ctaSub: string };
};

type GamedayMeta = {
  enabled: boolean;
  instagram: string; facebook: string; caption: string;
  items: { id: string; src: string; label: string; on: boolean }[];
};
```

**Slug derivation** (exact logic from `app.js:49`):
```js
id = city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
```

---

## Custom Events

| Event | Fired when | Consumer |
|---|---|---|
| `clvch:locations-changed` | Any city add / update / remove | Nav ticker re-render; Next.js → `revalidatePath('/')` |
| `clvch:home-changed` | Home content saved | Next.js → `revalidatePath('/')` |

---

## Design Tokens (`:root` in `styles.css`)

```css
--ink:        #0a0a0a;                  /* page background */
--ink-2:      #111111;
--ink-3:      #181818;
--bone:       #ffffff;                  /* primary text */
--bone-dim:   rgba(255,255,255,0.88);
--bone-muted: rgba(255,255,255,0.55);
--gold:       #ffffff;                  /* PLACEHOLDER — real brand gold TBD */
--gold-deep:  #000000;
--gold-soft:  rgba(255,255,255,0.08);
--line:       rgba(255,255,255,0.18);   /* borders */
--line-soft:  rgba(255,255,255,0.09);
```

`--gold` is currently `#ffffff` (white) — a placeholder. Replace with the real brand accent color before launch and confirm with the brand owner. All `<em>` tags inside headings should render in this color.

Full token list is in `source/styles.css` `:root` block (lines 6–35). Translate 1:1 to Tailwind `theme.extend.colors` or CSS Modules `:root`.

---

## Next.js Route Map

| Prototype hash route | Next.js App Router path | Auth |
|---|---|---|
| `#/` | `app/page.tsx` | Public |
| `#/locations` | `app/locations/page.tsx` | Public |
| `#/locations/[id]` | `app/locations/[city]/page.tsx` | Public |
| `#/reserve` | `app/reserve/page.tsx` | Public |
| `#/admin` | `app/admin/page.tsx` | `super` only |
| `#/admin/home` | `app/admin/home/page.tsx` | `super` only |
| `#/admin/[city]` | `app/admin/[city]/page.tsx` | `super` OR `manager` scoped to that city |

Auth roles live in `staff_roles` table. Super has `city_id = null`; manager has a required `city_id`.

---

## Architectural Decisions to Preserve

- **Atomic JSONB for home content** — save the entire `HomeContent` object as one document, not per-field mutations.
- **Soft-delete only** — cities use a `disabled` flag; never hard-delete a city row.
- **Status enum** — `open / prep / soon` only. Drives color pills. Do not add free-form status values.
- **No rounded corners** — `border-radius: 0` everywhere. Hard brand constraint.
- **Gold `<em>` rule** — `<em>` inside headings is always `--gold`, italic, Cormorant Garamond. Do not repurpose `<em>` for other styling.
- **Grid form layout** — admin forms use `grid-template-columns: 220px 1fr`. Preserve this in React.
- **Shallow merge on load** — always spread defaults before stored data when hydrating from DB/localStorage. This allows schema fields to be added without breaking existing saves.

---

## Common Gotchas

- `routes.js` uses `grid-row: 1 / -1` to span full grid height. Do not replace with `span 99`.
- Admin city rows use `<details>` for expand/collapse. The prototype does not enforce one-open-at-a-time — do not add that behavior unless explicitly requested.
- `HOME_SEED.hero.blurb` contains raw HTML (`<em>` tags). In React, use `dangerouslySetInnerHTML` or sanitize and convert to MDX.
- The concierge drawer calls `window.claude.complete()` — this is a Claude API stub. In Next.js, wire it to an API route (`/api/concierge`) that calls the Anthropic SDK.
- All images in `assets/` are placeholder photography. Do not ship to production; replace with licensed brand imagery.
- The README references "Big Caslon" and "IBM Plex Mono" as font choices; the prototype currently uses "Bebas Neue" and "JetBrains Mono". Confirm final font decisions with the brand owner before purchasing commercial licenses.
- `pressLogos` in `HomeContent` is an array of image URLs. The prototype seeds it as an empty array — populate with real press/partner logos before launch.
