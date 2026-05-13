# Handoff: CLVCH 2026 — Hospitality Group Website + Staff Admin

## Overview

CLVCH is a multi-city restaurant/nightclub/sports-bar brand. This handoff covers the marketing site and a back-of-house admin panel that lets staff edit cities, gameday posters, and home page content.

The package contains:
- **`source/`** — the working HTML/CSS/JS prototype (open `source/index.html` in a browser to interact with it)
- **`screenshots/`** — rendered views of every page
- **`SCHEMA.sql`** — Postgres schema mapped to the prototype's data model
- **`README.md`** — this file

---

## About the design files

The files in `source/` are **design references created in HTML** — a clickable prototype showing the intended look, content, and behavior. They are **not production code to ship**. Your task is to recreate the designs in **Next.js (App Router) + React + Postgres** while preserving the visual language, interaction patterns, and data model.

Persistence in the prototype is `localStorage`. In the real build it must move to Postgres + cloud media storage (see "Stack" below).

## Fidelity

**High-fidelity.** Final colors, typography, spacing, copy, layout, animations. Match pixel-for-pixel where possible. The aesthetic — black/bone/gold editorial, Big Caslon display + IBM Plex Mono kicker — is the brand and should not drift.

---

## Stack (decided)

| Layer | Choice |
|---|---|
| Framework | **Next.js 15 + React 18, App Router** |
| Database | **Postgres** (Supabase / Neon / Vercel Postgres — pick one) |
| ORM | Prisma or Drizzle (your call) |
| Auth | **SSO for staff** (Google + Microsoft via NextAuth/Auth.js) — no public sign-up |
| Media storage | **Cloud object store** (S3 / Cloudflare R2 / Supabase Storage) — never store binary in the DB |
| Styling | CSS Modules or Tailwind — the prototype uses plain CSS with custom properties; either approach works as long as the design tokens below are honored |
| Hosting | Vercel (matches Next.js + Auth.js) |

---

## Routes (current prototype hash routes → real Next.js paths)

| Prototype | Next.js App Router path | Notes |
|---|---|---|
| `#/` | `/` | Home — hero, pillars, location switcher, marquee, press, reserve CTA |
| `#/locations` | `/locations` | All-cities index with map and list |
| `#/locations/[id]` | `/locations/[city]` | City detail (Atlanta, Miami, etc.) |
| `#/reserve` | `/reserve` | Reservation stub (form, picks city) |
| `#/admin` | `/admin` | Staff admin — city table (super) or scoped city dashboard (manager) |
| `#/admin/home` | `/admin/home` | Super-only home page editor |
| `#/admin/[id]` | `/admin/[city]` | City editor (super → any city, manager → only their city) |

The footer has a discreet "Staff" link to `/admin`. Keyboard shortcut **Shift + A** also jumps to admin.

---

## Auth & roles

Two roles, mocked in the prototype via `localStorage.clvch_admin_role`:

- **`super`** — sees everything: full city table, can create/disable/delete cities, edit home page, edit any city.
- **`manager:<cityId>`** — sees only their city: city editor + gameday posters. Cannot reach `/admin/home` or other cities.

Implementation:
1. NextAuth/Auth.js with Google + Microsoft providers, restricted to allowlisted email domains.
2. `staff_roles` table maps `user_id` → `(role, city_id?)`. See `SCHEMA.sql`.
3. Middleware on `/admin/*` checks the role and routes accordingly:
   - manager hitting `/admin` redirects to `/admin/<their-city>`
   - manager hitting another city or `/admin/home` shows a "Wrong door" 403 page (see prototype)
4. Audit every mutation to `admin_audit_log`.

---

## Data model

See `SCHEMA.sql` for the full Postgres schema. Three top-level domains:

### 1. Cities (`cities` + `city_marquee_words`)
Everything about a venue: name, state, slug (id), status (`open` / `prep` / `soon`), tonight headline + time, address, phone, hours, capacity, opened year, hero image, blurb, map pin coordinates, disabled flag, marquee words.

### 2. Gameday (`city_gameday_meta` + `gameday_posters`)
Per-city section toggle, caption, social handles, plus a list of uploaded poster images each with their own on/off toggle.

### 3. Home content (`home_content`, single JSONB row)
The home page sections that aren't tied to a city — hero, pillars, marquee words, press logos, reserve strip. Stored as one JSONB document because the admin form saves it atomically. Document shape:

```ts
type HomeContent = {
  hero: {
    chapter: string;       // e.g. "Chapter Ⅳ / 2026"
    estLine: string;       // "Est. 2022"
    word1: string;         // headline word 1 ("Bites")
    word2: string;         // ("Beats")
    word3: string;         // ("Booze")
    subModes: string[];    // ["Modern American", "Sports Theatre", "Gold-Room Nightclub"]
    blurb: string;         // supports <em> tags
    videoSrc: string;      // cloud URL to hero video
  };
  pillars: {
    headline: string;      // supports <br> and <em>
    intro: string;
    items: Array<{
      num: string;         // "01 / Kitchen"
      title: string;       // "Bites"
      copy: string;
      listLabel: string;   // "Signatures"
      listItems: string;   // "Item · Item · Item"
      image: string;       // cloud URL
    }>;
  };
  marqueeWords: string[];  // home page bottom marquee
  pressLogos: string[];    // "Eater", "VOGUE", etc.
  reserveStrip: {
    eyebrow: string;
    headline: string;      // supports <br> and <em>
    sub: string;
    ctaTitle: string;
    ctaSub: string;
  };
};
```

The prototype stores this in `localStorage.clvch_home`. Move it to the `home_content` table verbatim.

---

## Media uploads

The prototype reads files via `FileReader` → data URL and stuffs them into `localStorage`. **Do not ship that pattern.** Replace with:

1. Client picks a file via `<input type="file">`.
2. POST to `/api/uploads/sign` (server-side) → returns a presigned PUT URL for S3/R2/Supabase Storage.
3. Browser PUTs the file directly to the bucket.
4. POST the resulting public URL back to the city / poster / home content row.
5. Validate file types server-side: `image/*` for hero/pillar/poster images, `video/mp4` for hero video. Cap sizes (suggest: 8 MB images, 50 MB video).

Affected fields: `cities.hero_url`, `gameday_posters.src`, `home_content.data.hero.videoSrc`, `home_content.data.pillars.items[].image`.

---

## Pages — what each does

### `/` Home
Hero with looping silent video, three-word headline ("Bites · Beats · Booze") with a sub-mode line that highlights one mode at a time, blurb, location count link to /reserve. Below: a three-pillar editorial grid (kitchen / floor / bar) alternating image-left/image-right. Then a "Pick a city" interactive switcher (search + filter + list on the left, full-bleed hero with metadata on the right; hover/click a city to swap). Marquee strip, press logos, reserve CTA, footer.

### `/locations`
Same brand chrome, large editorial title, world map with active pins, scrollable city cards, status filters. Each card links to `/locations/[city]`.

### `/locations/[city]` (Venue detail)
Full-width hero image of the venue. Detail block: address, phone, hours, capacity, opened year, tonight headline, blurb. City-specific marquee words. Pillars adapted to the city's voice. Map pin. Reserve CTA. Footer.

### `/reserve`
Two-column: left form (date, time, party, city dropdown), right "What to expect" copy. City preselected from `?city=` query.

### `/admin` (super)
Header with "House control" title + role chip (signed in as Super admin, View site, Sign out). Tabs: All cities · Home page · [city tabs]. Below: city table — each row expands to reveal the full city editor (Identity, Status & Tonight, Contact, Hero & Story, Marquee Words, Map Coordinates, Gameday Posters, Danger Zone). Top-right: "+ Add city" reveals an inline new-city form. "Reset to defaults" button.

### `/admin/[city]` (manager OR super-with-city-tab)
Same six-section city editor as above, scoped to one city. Manager view hides the city-table chrome.

### `/admin/home` (super only)
Eight form sections — Hero (chapter, est, video upload, three headline words, three sub-modes, blurb), Pillars (headline + intro), Pillar 1/2/3 (kicker, title, copy, list label, list items, image upload), Marquee words, Press logos, Reserve strip. "Save changes" persists the whole document atomically. "Reset home to default" reseeds.

---

## Design tokens

From `source/styles.css` (CSS custom properties on `:root`):

### Color
| Token | Value | Use |
|---|---|---|
| `--ink` | `#08070a` | Page background |
| `--ink-2` | `#0c0b0f` | Card / surface background |
| `--ink-3` | `#13121a` | Elevated surface |
| `--bone` | `#ece6d6` | Primary text |
| `--bone-dim` | `#cfc6b3` | Secondary text |
| `--bone-muted` | `oklch(0.74 0.025 90)` | Tertiary / labels |
| `--gold` | `#c8a96a` | Accent / italic emphasis |
| `--gold-deep` | `#8a6a36` | Hover accent |
| `--ghost` | `oklch(0.55 0.02 90)` | Disabled / placeholder |
| `--line` | `rgba(236,230,214,0.18)` | Borders |
| `--line-soft` | `rgba(236,230,214,0.08)` | Subtle dividers |

Status colors (admin pills):
- Open → `oklch(0.85 0.12 145)` (green)
- Prep → `oklch(0.88 0.12 80)` (gold)
- Soon → muted bone
- Off / Danger → `#ff8b7e`

### Type
| Family | CSS var | Source |
|---|---|---|
| Display (huge titles) | `--display` | "Big Caslon", "Playfair Display", serif |
| Editorial italic | `--editorial` | "Playfair Display", "Cormorant Garamond", serif italic |
| Body | `--body` | "Söhne", "Inter", system-ui |
| Mono / kicker | `--mono` | "IBM Plex Mono", "Söhne Mono", ui-monospace |

Convention: all-caps mono kickers use `letter-spacing: 0.22em` to `0.28em`. Display headings use `letter-spacing: 0.01em–0.02em` and tight line-height (~0.95). Italic emphasis (`<em>`) inside display heads switches to the editorial family in gold.

### Spacing & layout
- Page padding: `--pad: clamp(20px, 4vw, 56px)` — used for left/right gutters
- Max content width: 1440px on home, 1200px on admin
- Section vertical rhythm: 80–120px top, 60–100px bottom
- Form section internal gap: 14px between rows, 32px between section head and body
- Border radius: **0 everywhere** — the brand is editorial/architectural, not rounded

### Animations
- Hover transitions: 200ms on `border-color`, `background`, `color`, `transform`
- Marquee scroll: 40s linear infinite (track is duplicated for seamless loop)
- Status dot pulse: 2s ease-in-out infinite, drops to 0.4 opacity at 50%
- Hero sub-modes cycle: highlight one for ~3s, fade to next

---

## Interactions

### Home location switcher
- Hover (or click on touch) any list item → swap the right-side hero frame.
- Search filter narrows the list; an empty state appears if zero match.
- Filter buttons: All / Open now / Coming soon.

### Map pins (locations index, venue detail)
- Click a pin → swap the meta card to that city's data without navigating.

### Admin city table
- Each row is a `<details>` element. Click to expand inline; only one row expanded is fine but no enforcement.
- Status pill colors derived from `status` enum.
- "+ Add city" toggles a new-city slot at the top with an empty form. Slug auto-derives from city name; user can override.
- Disable button toggles `disabled` flag (city stays in the DB, hidden from public).
- Delete button confirms and removes the city + its posters + marquee words (cascade).

### Admin forms
- Every form section is `(220px label column | 1fr content column)`. The section head spans all rows of column 1; all other children stack in column 2. **Critical**: do not use `grid-row: 1 / span 99`; use `grid-row: 1 / -1`.
- Hero / pillar image fields: text input + live preview + "Upload from device" button.
- Hero video field (home only): same pattern, with a size warning above 8 MB.
- Coords editor: x/y number inputs drive a live SVG pin preview.
- "Save changes" is a real submit; success message appears in the form footer for ~2.2s, then clears.

### Real-time re-render
The prototype dispatches `clvch:locations-changed` and `clvch:home-changed` events on save; the public router listens and re-renders when the user is viewing a public page. In Next.js, use:
- Server actions for mutations + `revalidatePath('/')` / `revalidateTag('home')` after save
- Or React Query / SWR with optimistic updates if the admin needs sub-second feedback

---

## State management

Server-state only. There is no client store worth speaking of.

- All admin reads + mutations go through Next.js server actions.
- Public pages render server-side from Postgres; cache at the route level.
- Form state inside admin forms can stay local (uncontrolled or `useFormState`).
- Auth/session state from Auth.js's `useSession` / `auth()`.

---

## Assets

In `source/assets/`:

| File | Use |
|---|---|
| `CLVCH-header-logo.png` | Top-nav logotype |
| `CLVCH-nav-letters.png` | Compact mark used in nav |
| `CLVCH-letters-white.png` | Footer / large display |
| `CLVCH-logo-white.png` | Square mark |
| `img-food-1.jpg` | Pillar 1 (kitchen) — placeholder photography |
| `img-club-1.jpg` | Pillar 2 (floor) — placeholder photography |
| `img-drink-1.jpg` | Pillar 3 (bar) — placeholder photography |
| `img-sports-1.jpg` | Sports / venue interior — placeholder |

The hero video (`hero.mp4`) is referenced but not bundled here — replace with brand-supplied B-roll.

All photography in this bundle is placeholder and should be swapped for licensed brand imagery before launch.

---

## Files

```
source/
  index.html         — page shell, nav, citygate modal, concierge drawer
  styles.css         — full design system (~2400 lines)
  app.js             — data layer (locations, gameday, home), helpers, ticker
  routes.js          — every page renderer + admin renderer + form wiring
  assets/            — logos + placeholder photography

screenshots/
  01-home.png
  02-locations.png
  04-reserve.png
  05-admin-gate.png
  06-admin-cities.png
  07-admin-home-editor.png

SCHEMA.sql           — Postgres schema with RLS hooks
README.md            — this file
```

---

## Recommended build order

1. **Auth + role gate** — wire NextAuth (Google + Microsoft), seed `staff_roles` with super admin emails. Build the `/admin` middleware that distinguishes super vs manager. Get the sign-in card working end-to-end before touching content.
2. **Schema + seed** — run `SCHEMA.sql`, write a seed script that mirrors `app.js`'s `LOCATIONS_SEED`, `GAMEDAY_SEED`, `HOME_SEED`. Confirm the public home page renders from DB.
3. **Public site** — port routes 1:1 from `routes.js`. Server components only; no client JS for the marketing pages except the location switcher (small client island) and the marquee.
4. **Media pipeline** — set up the cloud bucket, presigned upload endpoint, public URL strategy.
5. **Admin: city editor** — the biggest piece. Six form sections, three buttons (Save / Disable / Delete), plus the gameday poster sub-block.
6. **Admin: home editor** — eight sections, JSONB save.
7. **Admin: city table** — list, add, scoping logic.
8. **Audit log** — every mutation writes an `admin_audit_log` row.
9. **Polish** — keyboard shortcut (Shift+A), footer "Staff" link, reset-to-defaults (super only, behind a confirmation), status pill animations, marquee timing.

---

## Open questions for the developer to confirm with the brand owner

- Reservation backend — is `/reserve` integrating with Resy/OpenTable/SevenRooms, or is it a custom form that emails the host?
- Real fonts — Big Caslon, Söhne, IBM Plex Mono need licenses. Confirm Adobe Fonts / self-hosted licenses.
- Image rights — replace all placeholder JPGs with licensed brand photography before launch.
- Domains for staff SSO allowlist — only `@clvch.com` (or whatever the company domain is) should be allowed past auth.
- Multi-language — not in this prototype. Confirm out of scope.

---

## Anything not covered above is intentional latitude

If a screen-state isn't documented (loading skeletons, empty states beyond "No cities match"), use the brand vocabulary: bone-on-ink, mono labels, no rounded corners, generous letter-spacing on caps. When in doubt, look at the existing admin forms — they are the design system in concentrated form.
