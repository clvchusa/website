/* ═══════════════════════════════════════════════════════════════
   CLVCH 2026 — Core data & behaviors
   ═══════════════════════════════════════════════════════════════ */

window.CLVCH = window.CLVCH || {};

/* ─────── Locations ───────
   The seed below is the canonical fallback (Atlanta only). On every boot
   we hydrate from localStorage (key: clvch_locations) if present so admin
   edits survive. "Reset to defaults" wipes the key to fall back to seed. */
const LOCATIONS_SEED = [
  {
    id: "atlanta",
    city: "Atlanta",
    state: "Georgia",
    status: "open",
    tonight: "Live DJ Set · Throwback Hits",
    tonightTime: "10 PM – 2 AM",
    address: "1280 Peachtree St NE · Atlanta, GA 30309",
    phone: "+1 (404) 555-1234",
    hours: "Mon–Thu 4–12 · Fri 4–2 · Sat 12–2 · Sun 12–12",
    capacity: 340,
    opened: "2022",
    hero: "../assets/img-club-1.jpg",
    blurb: "The flagship. Wall-to-wall screens by day, gold-room energy by night.",
    marqueeWords: ["Peachtree", "Sunday Football", "Gold Room", "Smash Burgers", "King of the South", "Late Kitchen"],
    disabled: false,
    reservations_enabled: true,
    roomImages: { bites: [], beats: [], booze: [] },
  },
];

window.CLVCH.locations = (() => {
  try {
    const stored = JSON.parse(localStorage.getItem("clvch_locations") || "null");
    if (Array.isArray(stored) && stored.length) return stored;
  } catch {}
  return JSON.parse(JSON.stringify(LOCATIONS_SEED));
})();

window.CLVCH._locationsSeed = () => JSON.parse(JSON.stringify(LOCATIONS_SEED));

window.CLVCH.saveLocations = () => {
  try { localStorage.setItem("clvch_locations", JSON.stringify(window.CLVCH.locations)); } catch {}
  window.dispatchEvent(new Event("clvch:locations-changed"));
};

window.CLVCH.slugify = (str) =>
  String(str || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

window.CLVCH.addCity = (data) => {
  const id = window.CLVCH.slugify(data.id || data.city);
  if (!id) return null;
  if (window.CLVCH.locations.some(l => l.id === id)) return null;
  const fresh = {
    id,
    city: data.city || "",
    state: data.state || "",
    status: data.status || "soon",
    tonight: data.tonight || "",
    tonightTime: data.tonightTime || "",
    address: data.address || "",
    phone: data.phone || "",
    hours: data.hours || "",
    capacity: Number(data.capacity) || 0,
    opened: data.opened || "",
    hero: data.hero || "../assets/img-club-1.jpg",
    blurb: data.blurb || "",
    marqueeWords: Array.isArray(data.marqueeWords) ? data.marqueeWords : [],
    disabled: false,
    reservations_enabled: Boolean(data.reservations_enabled) || false,
    roomImages: data.roomImages || { bites: [], beats: [], booze: [] },
  };
  window.CLVCH.locations.push(fresh);
  // Seed an empty gameday entry so the city page has a section to toggle
  if (!window.CLVCH.gameday[id]) {
    window.CLVCH.gameday[id] = {
      enabled: false,
      instagram: "clvch_" + id,
      facebook: "clvch" + id,
      caption: "",
      items: [],
    };
    window.CLVCH.saveGameday();
  }
  window.CLVCH.saveLocations();
  return fresh;
};

window.CLVCH.updateCity = (id, patch) => {
  const i = window.CLVCH.locations.findIndex(l => l.id === id);
  if (i < 0) return null;
  const existing = window.CLVCH.locations[i];
  const merged = { ...existing, ...patch };
  window.CLVCH.locations[i] = merged;
  window.CLVCH.saveLocations();
  return merged;
};

window.CLVCH.removeCity = (id) => {
  const before = window.CLVCH.locations.length;
  window.CLVCH.locations = window.CLVCH.locations.filter(l => l.id !== id);
  if (window.CLVCH.gameday[id]) {
    delete window.CLVCH.gameday[id];
    window.CLVCH.saveGameday();
  }
  window.CLVCH.saveLocations();
  return window.CLVCH.locations.length < before;
};

window.CLVCH.resetAll = () => {
  try {
    localStorage.removeItem("clvch_locations");
    localStorage.removeItem("clvch_gameday");
    localStorage.removeItem("clvch_home");
    localStorage.removeItem("clvch_menu");
  } catch {}
};

/* ─────── Home page content ─────── */
const HOME_SEED = {
  hero: {
    chapter: "Chapter Ⅳ / 2026",
    estLine: "Est. 2022",
    word1: "Bites",
    word2: "Beats",
    word3: "Booze",
    subModes: ["Modern American", "Sports Theatre", "Gold-Room Nightclub"],
    blurb: "Four rooms. One brand. <em>CLVCH</em> is a hospitality house where the kitchen, the screens, and the dance floor never compete — they share the same oxygen.",
    videoSrc: "../assets/hero.mp4",
  },
  pillars: {
    headline: "Three rooms,<br>one <em>address.</em>",
    intro: "CLVCH doesn't ask you to choose between the big game and the tasting menu. Between the deal-closing drink and the dance floor at 1 AM. We built a house that hosts all of it, beautifully.",
    items: [
      { num: "01 / Kitchen", title: "Bites", copy: "A modern American kitchen rooted in Southern flavor. Wood-fired steaks, smash burgers, hot honey wings, oysters from the Gulf.", listLabel: "Signatures", listItems: "Prime Smash Burger · Hot Honey Wings · Bourbon Ribeye · Truffle Fries", image: "../assets/img-food-1.jpg", images: ["../assets/img-food-1.jpg"] },
      { num: "02 / Floor", title: "Beats", copy: "Thursday through Saturday, the lights drop at ten and the room becomes a club. Residencies, guest DJs, a floor that holds 340, and a Gold Room that holds secrets.", listLabel: "This week", listItems: "Throwback Thu · Open Floor Fri · Gold Room Sat", image: "../assets/img-club-1.jpg", images: ["../assets/img-club-1.jpg"] },
      { num: "03 / Bar", title: "Booze", copy: "A bar program run like a kitchen — fat-washed bourbons, smoked syrups, hand-cut ice. Classic spines, unexpected seasoning.", listLabel: "Pour list", listItems: "Gold Rush Old Fashioned · Smoked Margarita · Midnight Mojito · Espresso Martini", image: "../assets/img-drink-1.jpg", images: ["../assets/img-drink-1.jpg"] },
    ],
  },
  marqueeWords: ["Sunday Football", "Late Kitchen", "Gold Room", "Every Day Brunch", "Private Events", "Live DJs"],
  menuPdf: "",
  reserveStrip: {
    eyebrow: "Book the night",
    headline: "A table, a <em>night,</em><br>the house.",
    sub: "Standard reservations open 60 days out. Private events, buyouts, and VIP suites handled directly by the Maître D'.",
    ctaTitle: "Reserve",
    ctaSub: "→ All cities",
  },
  contact: {
    general:   "hello@clvch.co",
    events:    "private@clvch.co",
    press:     "press@clvch.co",
    franchise: "franchise@clvch.co",
    instagram: "clvch.usa",
    facebook:  "clvch.usa",
  },
};

window.CLVCH.home = (() => {
  try {
    const stored = JSON.parse(localStorage.getItem("clvch_home") || "null");
    if (stored && typeof stored === "object") {
      const storedItems = stored.pillars?.items;
      const seedItems = HOME_SEED.pillars.items;
      const mergedItems = storedItems
        ? storedItems.map((p, i) => ({ ...seedItems[i], ...p, images: Array.isArray(p.images) && p.images.length ? p.images : (seedItems[i]?.images || [p.image || seedItems[i]?.image]) }))
        : seedItems;
      return {
        ...HOME_SEED, ...stored,
        hero: { ...HOME_SEED.hero, ...(stored.hero || {}) },
        pillars: { ...HOME_SEED.pillars, ...(stored.pillars || {}), items: mergedItems },
        reserveStrip: { ...HOME_SEED.reserveStrip, ...(stored.reserveStrip || {}) },
      };
    }
  } catch {}
  return JSON.parse(JSON.stringify(HOME_SEED));
})();
window.CLVCH._homeSeed = () => JSON.parse(JSON.stringify(HOME_SEED));
window.CLVCH.saveHome = () => {
  try { localStorage.setItem("clvch_home", JSON.stringify(window.CLVCH.home)); } catch {}
  window.dispatchEvent(new Event("clvch:home-changed"));
};
/* ═══ Gameday posters (per-city) — would be manager-uploaded ═══
   Each location gets a poster set. `enabled` = city manager toggle.
   `items` = posters; each has its own `on` flag (super-admin toggle for
   homepage rotation, also honored on city page).
   Persisted to localStorage so admin tweaks survive a refresh. */
const CLVCH_DEFAULT_POSTER = "../assets/img-club-1.jpg";

const GAMEDAY_SEED = {
  atlanta: {
    enabled: true,
    instagram: "clvch_atlanta",
    facebook: "clvchatlanta",
    caption: "Sunday Night Football · Kitchen till 1 AM",
    items: [
      { id: "atl-1", src: "../assets/img-sports-1.jpg", label: "Sunday Night · 8 PM", on: true },
      { id: "atl-2", src: "../assets/img-club-1.jpg",   label: "Throwback Thursday", on: true },
      { id: "atl-3", src: "../assets/img-food-1.jpg",   label: "Gameday Brunch · Sat 11 AM", on: true },
    ],
  },
};

window.CLVCH.gameday = (() => {
  try {
    const stored = JSON.parse(localStorage.getItem("clvch_gameday") || "null");
    if (stored && typeof stored === "object") return { ...GAMEDAY_SEED, ...stored };
  } catch {}
  return JSON.parse(JSON.stringify(GAMEDAY_SEED));
})();

window.CLVCH.saveGameday = () => {
  try { localStorage.setItem("clvch_gameday", JSON.stringify(window.CLVCH.gameday)); } catch {}
};

window.CLVCH.defaultPoster = CLVCH_DEFAULT_POSTER;

// Helper: collect all enabled posters from enabled cities (for homepage rotation)
window.CLVCH.allEnabledPosters = () => {
  const out = [];
  for (const city of window.CLVCH.locations) {
    const g = window.CLVCH.gameday[city.id];
    if (!g || !g.enabled) continue;
    for (const it of (g.items || [])) {
      if (it.on) out.push({ ...it, cityId: city.id, city: city.city });
    }
  }
  return out;
};

/* ─────── Markdown → HTML (admin-only content, no XSS risk) ─────── */
window.CLVCH.markdownToHtml = function(md) {
  if (!md) return '';
  function inline(s) {
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    s = s.replace(/_([^_\n]+)_/g, '<em>$1</em>');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
    return s;
  }
  const blocks = [];
  const lines = md.split('\n');
  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith('### ')) {
      blocks.push('<h3>' + inline(trimmed.slice(4)) + '</h3>'); i++;
    } else if (trimmed.startsWith('## ')) {
      blocks.push('<h2>' + inline(trimmed.slice(3)) + '</h2>'); i++;
    } else if (trimmed.startsWith('# ')) {
      blocks.push('<h2>' + inline(trimmed.slice(2)) + '</h2>'); i++;
    } else if (trimmed.startsWith('> ')) {
      blocks.push('<blockquote><p>' + inline(trimmed.slice(2)) + '</p></blockquote>'); i++;
    } else if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      blocks.push('<hr>'); i++;
    } else if (trimmed === '') {
      i++;
    } else if (/^[*-] /.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[*-] /.test(lines[i].trim())) {
        items.push('<li>' + inline(lines[i].trim().slice(2)) + '</li>'); i++;
      }
      blocks.push('<ul>' + items.join('') + '</ul>');
    } else {
      const para = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t === '' || t.startsWith('#') || t.startsWith('>') || t === '---' || /^[*-] /.test(t)) break;
        para.push(t); i++;
      }
      if (para.length) blocks.push('<p>' + inline(para.join(' ')) + '</p>');
    }
  }
  return blocks.join('\n');
};

window.CLVCH.formatDate = function(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
};

/* ─────── Articles (Stories) ─────── */
const ARTICLES_SEED = [
  {
    id: 'game-day-at-clvch-atlanta',
    title: 'Game Day at CLVCH Atlanta',
    excerpt: "Every Sunday, we turn the main floor into the best seat in the house. Here's what that actually looks like.",
    body: "## The Setup\n\nWall-to-wall screens. A kitchen that runs until 1 AM. A bar program that doesn't shut down at halftime.\n\nGame day at CLVCH isn't about survival food and plastic cups — it's about doing it properly. We run our full menu, our full bar, and the energy in the room hits differently when 340 people are watching the same play.\n\n## What to Order\n\nStart with the **Hot Honey Wings** (12 pc) and the **Truffle Fries**. If there's a table of four or more, add the **Prime Smash Sliders** tray. For drinks, the **Smoked Margarita** is the move — or the **Gold Rush Old Fashioned** if it's a late game.\n\n## The Timing\n\nKitchen opens at noon on Sunday. By 3 PM the room is at capacity. Come early, or reserve a table for the night game.\n\n> \"Best game day spot I've found in Atlanta. Tables, full menu, and actual cocktails.\"",
    cityId: 'atlanta',
    cover: '../assets/img-sports-1.jpg',
    date: '2025-10-12',
    published: true,
    tags: ['gameday', 'atlanta', 'nfl'],
  },
  {
    id: 'why-we-built-clvch',
    title: 'Why We Built CLVCH',
    excerpt: "Three rooms, one address, and a conviction that great food and great atmosphere shouldn't be a trade-off.",
    body: "## The Problem We Kept Running Into\n\nEvery city has great restaurants. Every city has great bars. Almost none of them share a building — let alone a menu.\n\nWe kept ending up in situations where the food was good but the atmosphere was dead, or the room was electric but you were eating something you'd regret. CLVCH started as a solution to that specific frustration.\n\n## Three Rooms, One Address\n\nThe kitchen runs **Modern American** — Southern roots, wood-fired technique, a chef's approach to bar food. The nightlife floor handles Thursday through Saturday, lights down at ten. The Gold Room is what happens when a private dining room and a VIP section have a very good evening together.\n\n## What's Next\n\nAtlanta was chapter one. More cities are coming. The model stays the same: find the right building, build the right team, don't compromise on any of the three rooms.\n\nThe house is yours.",
    cityId: null,
    cover: '../assets/img-club-1.jpg',
    date: '2025-09-01',
    published: true,
    tags: ['brand', 'story'],
  },
  {
    id: 'the-perfect-pre-game',
    title: 'The Perfect Pre-Game Setup',
    excerpt: 'How to make the two hours before kickoff the best part of Sunday.',
    body: "## Arrive Before the Rush\n\nThe window is 11 AM to 1 PM. Kitchen is warm, bar is moving, and you can actually hear the table next to you. After 2 PM, you're competing with everyone who had the same idea.\n\n## Build the Table Right\n\nFor a group of four:\n\n- **Hot Honey Wings** (12 pc) — share these\n- **Truffle Fries** — one order per two people\n- **Prime Smash Burgers** — one each, order them medium\n- **Smoked Margaritas** — two pitchers for the table\n\n## The Rule\n\nOrder everything at once. Kitchens run cleaner when the whole table is in sync, and you won't miss the first drive chasing a server.",
    cityId: null,
    cover: '../assets/img-food-1.jpg',
    date: '2025-11-15',
    published: false,
    tags: ['gameday', 'tips'],
  },
];

window.CLVCH.articles = (() => {
  try {
    const stored = JSON.parse(localStorage.getItem('clvch_articles') || 'null');
    if (Array.isArray(stored)) return stored;
  } catch {}
  return JSON.parse(JSON.stringify(ARTICLES_SEED));
})();

window.CLVCH._articlesSeed = () => JSON.parse(JSON.stringify(ARTICLES_SEED));

window.CLVCH.saveArticles = () => {
  try { localStorage.setItem('clvch_articles', JSON.stringify(window.CLVCH.articles)); } catch {}
};

/* ─────── Menu ─────── */
const MENU_SEED = {
  coffee: [],
  kitchen: [
    { name: "Grilled Cheese", desc: "Sourdough, caramelized onions, basil, Dijon, mixed cheese · served with sweet potato chips, house salad & pickles", price: "$14.50", tag: "Sandwich" },
    { name: "Chipotle Roasted Chicken", desc: "Ciabatta, cheddar, pesto, lemon garlic aioli · served with sweet potato chips, house salad & pickles", price: "$16.50", tag: "Sandwich" },
    { name: "Turkey Club", desc: "Sourdough, bacon, cheddar, avocado · served with sweet potato chips, house salad & pickles", price: "$17.50", tag: "Sandwich" },
    { name: "Gourmet Ham & Brie", desc: "Ciabatta, Black Forest ham, Dijon, brie, fig jam · served with sweet potato chips, house salad & pickles", price: "$17.00", tag: "Sandwich" },
    { name: "Roasted Beef", desc: "Ciabatta, blue cheese, caramelized onions · served with sweet potato chips, house salad & pickles", price: "$18.00", tag: "Sandwich" },
    { name: "Double Cheese Burger", desc: "Two prime beef patties, brioche, sharp cheddar, pickles · Add bacon +$3 · Add egg +$1.50", price: "$18.99", tag: "Burger" },
    { name: "Tomato Basil Soup", desc: "Vine-ripened tomato & sweet basil velouté · served with garlic baguette", price: "$6.99", tag: "Soup" },
    { name: "Crème of Mushroom", desc: "Forest mushrooms, fresh cream, thyme, truffle oil · served with garlic baguette", price: "$8.99", tag: "Soup" },
    { name: "French Onion Soup", desc: "Thyme-infused beef broth, Gruyère · served with garlic baguette", price: "$9.99", tag: "Soup" },
    { name: "Greek Salad", desc: "Fresh veggies, Kalamata olives, feta crumbs, lemon oregano dressing", price: "$12.99", tag: "Salad" },
    { name: "Cobb Salad", desc: "Chicken, bacon, avocado, egg, blue cheese", price: "$15.99", tag: "Salad" },
    { name: "Kale Caesar", desc: "Garlic sourdough, parmesan, classic Caesar dressing · Add chicken +$2 · Add salmon +$3", price: "$15.99", tag: "Salad" },
    { name: "Nachos", desc: "Tortilla chips, queso cheese, jalapeños, sour cream, guacamole, salsa", price: "$12.99", tag: "Appetizer" },
    { name: "Crispy Onion Rings", desc: "Lightly battered, golden fried", price: "$9.99", tag: "Appetizer" },
    { name: "Sweet Potato Fries", desc: "Basket of seasoned sweet potato fries", price: "$6.99", tag: "Appetizer" },
    { name: "Jalapeño Poppers", desc: "Stuffed jalapeños, crispy battered", price: "$12.99", tag: "Appetizer" },
    { name: "Buffalo Wings", desc: "Celery, blue cheese dip", price: "$10.99", tag: "Appetizer" },
    { name: "Chicken Tenders", desc: "Sweet potato fries, blue cheese dip", price: "$12.99", tag: "Appetizer" },
    { name: "Fish N Chips", desc: "Sweet potato sauce, tartar sauce", price: "$16.99", tag: "Appetizer" },
    { name: "10 oz Ribeye", desc: "Citrus chive potato mash, sautéed vegetables, peppercorn sauce", price: "$27.99", tag: "Steak" },
    { name: "New York Strip", desc: "Citrus chive potato mash, sautéed vegetables, peppercorn sauce", price: "$32.00", tag: "Steak" },
    { name: "T-Bone", desc: "Citrus chive potato mash, sautéed vegetables, peppercorn sauce", price: "$30.00", tag: "Steak" },
    { name: "Herb Crusted Salmon / Sea Bass", desc: "Parsley, tarragon, lemon thyme butter sauce", price: "$28.00", tag: "Seafood" },
    { name: "Corn Fed Chicken Breast", desc: "Thyme butter sauce", price: "$22.00", tag: "Entrée" },
    { name: "Country Style Pork Chops", desc: "With apple sauce", price: "$24.00", tag: "Entrée" },
    { name: "Pistachio Crushed Lamb Chops", desc: "Mint sauce", price: "$24.00", tag: "Entrée" },
    { name: "Mac N Cheese", desc: "Creamy house mac", price: "$14.99", tag: "Pasta" },
    { name: "Penne", desc: "Choice of Classic Tomato, Creamy Pesto, or Creamy Alfredo · Add veg +$2 · chicken +$3.50 · meatballs +$4 · sausage +$4 · shrimp +$6", price: "$14.99", tag: "Pasta" },
    { name: "Spaghetti", desc: "Choice of Classic Tomato, Creamy Pesto, or Creamy Alfredo · Add veg +$2 · chicken +$3.50 · meatballs +$4 · sausage +$4 · shrimp +$6", price: "$14.99", tag: "Pasta" },
    { name: "Ravioli", desc: "Choice of Classic Tomato, Creamy Pesto, or Creamy Alfredo · Add veg +$2 · chicken +$3.50 · meatballs +$4 · sausage +$4 · shrimp +$6", price: "$14.99", tag: "Pasta" },
    { name: "New York Cheesecake", desc: "With blueberry topping", price: "$10.49", tag: "Dessert" },
    { name: "Chocolate Brownie", desc: "With French vanilla ice cream", price: "$11.49", tag: "Dessert" },
    { name: "Warm Apple Pie", desc: "With vanilla ice cream", price: "$9.99", tag: "Dessert" },
    { name: "Tres Leches", desc: "With fresh berries", price: "$9.99", tag: "Dessert" },
  ],
  brunch: [
    { name: "Avocado Toast", desc: "Avocado, multigrain, baby beets, feta", price: "$14.99", tag: "Toast" },
    { name: "CLUCH Toast", desc: "Avocado, multigrain, poached cage-free egg, pumpkin seeds, Oscietra caviar", price: "$16.99", tag: "Signature" },
    { name: "Nordic Royal", desc: "Smoked salmon, caper, dill cream, scrambled egg", price: "$18.99", tag: "Toast" },
    { name: "Provençal Sunrise", desc: "Ratatouille ricotta, sunny side egg", price: "$16.99", tag: "Toast" },
    { name: "Smoky Morning Melts", desc: "Bacon, mushroom, caramelized onions, sunny side egg", price: "$16.99", tag: "Toast" },
    { name: "Italian Sunrise", desc: "Prosciutto ricotta, scrambled egg", price: "$18.99", tag: "Toast" },
    { name: "Brioche French Toast", desc: "Raspberry peach champagne jam, pecans, mascarpone, rose petals, fresh berries", price: "$15.99", tag: "French Toast" },
    { name: "Flambéed Foster", desc: "Caramelized bananas, apple, berries, rum flambé", price: "$16.99", tag: "French Toast" },
    { name: "Citrus Ricotta Pancake", desc: "Lemon ricotta, mascarpone, thyme honey, candied lemon zest", price: "$16.99", tag: "" },
    { name: "Omelette — Ratatouille, Spinach & Chèvre", desc: "3 cage-free eggs, ratatouille, baby spinach, chèvre · served with toast & house salad", price: "$14.99", tag: "Eggs" },
    { name: "Omelette — Fine Herbs & Gruyère", desc: "3 cage-free eggs, fine herbs, Gruyère · served with toast & house salad", price: "$12.99", tag: "Eggs" },
    { name: "Omelette — Ham, Mushroom & Cheddar", desc: "3 cage-free eggs, ham, mushroom, cheddar · served with toast & house salad", price: "$13.99", tag: "Eggs" },
    { name: "Omelette — Bacon, Cheddar & Gruyère", desc: "3 cage-free eggs, bacon, cheddar, Gruyère · served with toast & house salad", price: "$13.99", tag: "Eggs" },
    { name: "Plain Waffle", desc: "Mascarpone, butter, maple syrup, fresh berries", price: "$12.99", tag: "Waffle" },
    { name: "Chicken Potato Waffle", desc: "Bacon, glazed peaches, sweet potatoes, candied pecans", price: "$14.99", tag: "Waffle" },
    { name: "Scandinavian Royal Waffle", desc: "Smoked salmon, avocado, poached egg", price: "$16.99", tag: "Waffle" },
    { name: "Granola", desc: "Organic granola, berries, honey", price: "$9.75", tag: "Light" },
    { name: "Bircher Muesli", desc: "Overnight soaked oats, cream, nuts, fresh berries", price: "$10.99", tag: "Chef's Special" },
    { name: "Ham N Cheese Croissant", desc: "Smoked ham, fig jam, grain mustard, cheddar", price: "$12.99", tag: "" },
    { name: "Smoked Salmon Bagel", desc: "Smoked salmon, red onion, capers, tomato, dill cream", price: "$12.99", tag: "" },
    { name: "Southern Sunrise", desc: "Bacon, egg & cheddar cheese on biscuit", price: "$12.99", tag: "" },
    { name: "Quiche Lorraine", desc: "Cage-free eggs, ham, bacon, Swiss custard, buttery pie crust", price: "$14.99", tag: "" },
    { name: "Florentine Quiche", desc: "Baby spinach, cage-free eggs, Swiss custard, buttery pie crust", price: "$13.99", tag: "Vegetarian" },
    { name: "Drip Coffee", desc: "Freshly brewed · Small 8oz / Large 16oz", price: "$3.50 / $4.00", tag: "Coffee" },
    { name: "Espresso", desc: "Single 1oz / Double 2oz", price: "$3.75 / $5.00", tag: "Coffee" },
    { name: "Cappuccino", desc: "12oz", price: "$6.00", tag: "Coffee" },
    { name: "Cold Brew", desc: "Small 8oz / Large 16oz", price: "$6.00 / $7.00", tag: "Coffee" },
    { name: "Café Latte", desc: "12oz", price: "$7.00", tag: "Coffee" },
    { name: "Chai Latte", desc: "12oz", price: "$6.00", tag: "" },
    { name: "Café Mocha", desc: "12oz", price: "$7.50", tag: "Coffee" },
    { name: "Hot Chocolate", desc: "12oz", price: "$6.50", tag: "" },
    { name: "Selection of Teas", desc: "English Breakfast, Earl Grey, Camomile, Green Herbal", price: "$4.50", tag: "" },
    { name: "Soft Drinks", desc: "Coke, Diet Coke, Sprite", price: "$4.50", tag: "" },
  ],
  bar: [
    { name: "Citrus Saline Martini", desc: "Premium dry gin & vodka, citrus peel, dry sherry, saline solution — clean, layered, savory finish", price: "$16", tag: "Signature" },
    { name: "Pearl of the Orient", desc: "Pear-infused vodka, jasmine tea tincture, clarified lemon juice, rose petal garnish", price: "$16", tag: "Signature" },
    { name: "Golden Fino Elixir", desc: "Saffron-infused rum, fino sherry, honey — warm spice, dry elegance, golden finish", price: "$16", tag: "Signature" },
    { name: "Indigo Garden", desc: "Botanical gin, house citrus blend, blue pea flower — color transforms in the glass", price: "$15", tag: "Signature" },
    { name: "Kyoto Velvet", desc: "Japanese whisky, vodka, cardamom syrup — silky, gently spiced", price: "$18", tag: "Signature" },
    { name: "Elder Bloom Sour", desc: "Elderflower gin, oleo syrup, lemon blend — floral, crisp botanical finish", price: "$15", tag: "Signature" },
    { name: "Strawberry Negroni", desc: "Botanical gin, Campari, sweet vermouth, fresh strawberry purée", price: "$16", tag: "Signature" },
    { name: "Spiced Tropical Reverie", desc: "Kaffir lime gin, green chili mango purée — tropical fruit meets lingering heat", price: "$16", tag: "Signature" },
    { name: "Island Gold Daiquiri", desc: "Pineapple-infused rum, fresh lime juice, fine sugar", price: "$14", tag: "Signature" },
    { name: "Mango Ember Smash", desc: "Whisky, mango purée, fresh lime juice, honey", price: "$16", tag: "Signature" },
    { name: "Bud Light", desc: "Domestic lager", price: "$6", tag: "Beer" },
    { name: "Miller Lite", desc: "Domestic lager", price: "$6", tag: "Beer" },
    { name: "Michelob Ultra", desc: "Domestic lager", price: "$6", tag: "Beer" },
    { name: "Coors Light", desc: "Domestic lager", price: "$6", tag: "Beer" },
    { name: "Tropicalia", desc: "Creature Comforts craft ale", price: "$8", tag: "Craft" },
    { name: "Duende", desc: "Craft beer", price: "$8", tag: "Craft" },
    { name: "Cosmic Debris", desc: "Craft beer", price: "$8", tag: "Craft" },
    { name: "Basement IPA", desc: "India pale ale", price: "$8", tag: "Craft" },
    { name: "Corona Premier", desc: "Import lager", price: "$7", tag: "Import" },
    { name: "Dos Equis", desc: "Import lager", price: "$7", tag: "Import" },
    { name: "Guinness", desc: "Irish stout", price: "$8", tag: "Import" },
    { name: "Heineken", desc: "Import lager", price: "$7", tag: "Import" },
    { name: "Modelo Especial", desc: "Import lager", price: "$7", tag: "Import" },
    { name: "Stella Artois", desc: "Belgian lager", price: "$8", tag: "Import" },
    { name: "Elite Vodka", desc: "House pour", price: "$12", tag: "Vodka" },
    { name: "Absolut", desc: "Sweden", price: "$11", tag: "Vodka" },
    { name: "Tito's Handmade", desc: "Texas", price: "$12", tag: "Vodka" },
    { name: "Grey Goose", desc: "France", price: "$14", tag: "Vodka" },
    { name: "Beluga", desc: "Russia", price: "$22", tag: "Vodka" },
    { name: "Smirnoff", desc: "Classic", price: "$10", tag: "Vodka" },
    { name: "Belvedere 10", desc: "Poland, premium", price: "$28", tag: "Vodka" },
    { name: "Tanqueray No. Ten", desc: "London Dry", price: "$14", tag: "Gin" },
    { name: "Monkey 47", desc: "Black Forest, Germany", price: "$20", tag: "Gin" },
    { name: "Botanist Islay Dry Gin", desc: "Scotland", price: "$15", tag: "Gin" },
    { name: "Beefeater 24", desc: "London Dry", price: "$14", tag: "Gin" },
    { name: "Bombay Sapphire", desc: "London Dry", price: "$12", tag: "Gin" },
    { name: "Hendricks", desc: "Scotland, cucumber & rose", price: "$14", tag: "Gin" },
    { name: "Gordon's Gin", desc: "London Dry", price: "$10", tag: "Gin" },
    { name: "Jose Cuervo", desc: "Mexico", price: "$11", tag: "Tequila" },
    { name: "Don Fulani Fuerte", desc: "Mexico", price: "$16", tag: "Tequila" },
    { name: "Don Julio", desc: "Mexico", price: "$16", tag: "Tequila" },
    { name: "Patron", desc: "Mexico", price: "$16", tag: "Tequila" },
    { name: "1800 Tequila", desc: "Mexico", price: "$13", tag: "Tequila" },
    { name: "Deleon Añejo", desc: "Mexico, aged", price: "$18", tag: "Tequila" },
    { name: "Marquis de Montesquieu Armagnac", desc: "France", price: "$28", tag: "Brandy" },
    { name: "Rémy Martin VSOP", desc: "Cognac, France", price: "$18", tag: "Cognac" },
    { name: "Hennessy", desc: "Cognac, France", price: "$16", tag: "Cognac" },
    { name: "Nardini Grappa Bianca", desc: "Italy", price: "$14", tag: "Brandy" },
    { name: "La Caravedo Pisco Quebranta", desc: "Peru", price: "$13", tag: "Brandy" },
    { name: "E&J Brandy", desc: "USA", price: "$10", tag: "Brandy" },
    { name: "Buffalo Trace Bourbon", desc: "Kentucky", price: "$13", tag: "Bourbon" },
    { name: "Woodford Reserve", desc: "Kentucky Straight Bourbon", price: "$15", tag: "Bourbon" },
    { name: "Maker's Mark", desc: "Kentucky Bourbon", price: "$14", tag: "Bourbon" },
    { name: "Bulleit Bourbon", desc: "Kentucky", price: "$13", tag: "Bourbon" },
    { name: "Mochters US-1 Small Batch", desc: "Kentucky Bourbon", price: "$18", tag: "Bourbon" },
    { name: "Jack Daniel's Tennessee", desc: "Tennessee Whiskey", price: "$12", tag: "Whiskey" },
    { name: "Johnnie Walker Black", desc: "Blended Scotch", price: "$14", tag: "Scotch" },
    { name: "Dewars White Label", desc: "Blended Scotch", price: "$11", tag: "Scotch" },
    { name: "Chivas Regal 12 Yr", desc: "Blended Scotch", price: "$13", tag: "Scotch" },
    { name: "Chivas Regal 18 Yr", desc: "Blended Scotch", price: "$20", tag: "Scotch" },
    { name: "Ballantine's Finest", desc: "Blended Scotch", price: "$11", tag: "Scotch" },
    { name: "Monkey Shoulder", desc: "Blended Malt Scotch", price: "$14", tag: "Scotch" },
    { name: "Dewars Double Double 21 Yr", desc: "Premium Blended Scotch", price: "$28", tag: "Scotch" },
    { name: "Glenmorangie Original 10 Yr", desc: "Highlands", price: "$15", tag: "Single Malt" },
    { name: "Talisker 10 Yr", desc: "Isle of Skye", price: "$16", tag: "Single Malt" },
    { name: "Laphroaig 10 Yr", desc: "Islay, peated", price: "$17", tag: "Single Malt" },
    { name: "Glenallachie 12 Yr", desc: "Speyside", price: "$16", tag: "Single Malt" },
    { name: "Glenlivet 12 Yr", desc: "Speyside", price: "$15", tag: "Single Malt" },
    { name: "Macallan 12 Yr", desc: "Speyside", price: "$20", tag: "Single Malt" },
    { name: "Glenfiddich 12 Yr", desc: "Speyside", price: "$15", tag: "Single Malt" },
    { name: "Balvenie Doublewood 12 Yr", desc: "Speyside", price: "$18", tag: "Single Malt" },
    { name: "Aberfeldy 12 Yr", desc: "Highlands", price: "$15", tag: "Single Malt" },
    { name: "Oban 14 Yr", desc: "Highlands", price: "$20", tag: "Single Malt" },
    { name: "Lagavulin 16 Yr", desc: "Islay, peated", price: "$22", tag: "Single Malt" },
    { name: "Moët & Chandon Imperial", desc: "Champagne, France", price: "$110", tag: "Sparkling" },
    { name: "Veuve Clicquot Brut", desc: "Champagne, France", price: "$120", tag: "Sparkling" },
    { name: "La Marca Prosecco", desc: "Italy", price: "$36", tag: "Sparkling" },
    { name: "Luc Belaire Luxe", desc: "France", price: "$75", tag: "Sparkling" },
    { name: "Korbel Brut", desc: "California", price: "$32", tag: "Sparkling" },
    { name: "Barefoot Bubbly", desc: "California", price: "$26", tag: "Sparkling" },
    { name: "Cook's California", desc: "California", price: "$28", tag: "Sparkling" },
    { name: "Kendall-Jackson Chardonnay", desc: "Vintner's Reserve, California", price: "$42", tag: "Chardonnay" },
    { name: "Josh Cellars Chardonnay", desc: "California", price: "$36", tag: "Chardonnay" },
    { name: "Reva Langhe", desc: "Italy", price: "$65", tag: "Chardonnay" },
    { name: "Sonoma-Cutrer Chardonnay", desc: "California", price: "$58", tag: "Chardonnay" },
    { name: "Hartford Court Chardonnay", desc: "California", price: "$75", tag: "Chardonnay" },
    { name: "Chablis", desc: "France", price: "$70", tag: "Chardonnay" },
    { name: "Kim Crawford Sauvignon Blanc", desc: "New Zealand", price: "$40", tag: "Sauvignon Blanc" },
    { name: "Joel Gott Sauvignon Blanc", desc: "California", price: "$36", tag: "Sauvignon Blanc" },
    { name: "Duckhorn Sauvignon Blanc", desc: "Napa Valley", price: "$75", tag: "Sauvignon Blanc" },
    { name: "Oyster Bay Sauvignon Blanc", desc: "New Zealand", price: "$38", tag: "Sauvignon Blanc" },
    { name: "Meiomi Pinot Noir", desc: "California", price: "$45", tag: "Pinot Noir" },
    { name: "La Crema Pinot Noir", desc: "Sonoma Coast, California", price: "$52", tag: "Pinot Noir" },
    { name: "Decoy Pinot Noir", desc: "Sonoma Coast", price: "$55", tag: "Pinot Noir" },
    { name: "Domaine Carneros Pinot Clair", desc: "California", price: "$75", tag: "Pinot Noir" },
    { name: "Bogle Merlot", desc: "California", price: "$34", tag: "Merlot" },
    { name: "Josh Cellars Merlot", desc: "California", price: "$36", tag: "Merlot" },
    { name: "Château Souverain Merlot", desc: "California", price: "$38", tag: "Merlot" },
    { name: "Caymus Cabernet Sauvignon", desc: "Napa Valley", price: "$160", tag: "Cabernet" },
    { name: "Château de Costis Bordeaux Rouge", desc: "France", price: "$75", tag: "Cabernet" },
    { name: "Decoy Cabernet Sauvignon", desc: "Sonoma", price: "$58", tag: "Cabernet" },
    { name: "Robert Mondavi Cabernet", desc: "California", price: "$50", tag: "Cabernet" },
  ],
};

window.CLVCH.menu = (() => {
  try {
    const stored = JSON.parse(localStorage.getItem('clvch_menu') || 'null');
    if (stored && typeof stored === 'object' && stored.kitchen) {
      return { ...MENU_SEED, ...stored };
    }
  } catch {}
  return JSON.parse(JSON.stringify(MENU_SEED));
})();

window.CLVCH.saveMenu = () => {
  try { localStorage.setItem('clvch_menu', JSON.stringify(window.CLVCH.menu)); } catch {}
};

/* ═══ Admin shortcut: Shift+A jumps to /admin from anywhere ═══ */
document.addEventListener("keydown", (e) => {
  if (e.shiftKey && (e.key === "A" || e.key === "a") &&
      !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName)) {
    e.preventDefault();
    location.hash = "#/admin";
  }
});

/* ═══ Cursor glow ═══ */
(function cursor() {
  const g = document.getElementById("cursorGlow");
  if (!g) return;
  window.addEventListener("pointermove", (e) => {
    g.style.left = e.clientX + "px";
    g.style.top = e.clientY + "px";
  });
})();

/* ═══ Nav hide-on-scroll-down ═══ */
(function navHide() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  let last = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    nav.style.transition = "transform 400ms";
    nav.style.transform = (y > 120 && y > last) ? "translateY(-100%)" : "translateY(0)";
    last = y;
  }, { passive: true });
})();

/* ═══ City-gate email modal ═══
   Triggers once per session per city when a user clicks any link that
   targets a city (#/locations/<id> or #/reserve?city=<id>).
   Three paths: OAuth (Google/Apple — wired to placeholder success),
   email submit, or "skip as guest". Never blocks navigation. */
(function cityGate() {
  const gate = document.getElementById("cityGate");
  if (!gate) return;
  const form = document.getElementById("cityGateForm");
  const emailInput = document.getElementById("cityGateEmail");
  const cityLabel = document.getElementById("cityGateCity");
  const card = gate.querySelector(".citygate-card");

  const SEEN_KEY = "clvch_gate_seen";
  const getSeen = () => { try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"); } catch { return []; } };
  const markSeen = (id) => {
    const seen = getSeen();
    if (!seen.includes(id)) { seen.push(id); localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); }
  };
  const markEmail = (email) => {
    try { localStorage.setItem("clvch_email", email); } catch {}
  };

  const open = (cityId) => {
    const city = window.CLVCH.locations.find(l => l.id === cityId);
    cityLabel.textContent = city ? `CLVCH · ${city.city}` : "CLVCH · Step inside";
    card.innerHTML = card.dataset.original || card.innerHTML;
    if (!card.dataset.original) card.dataset.original = card.innerHTML;
    rebind();
    gate.classList.add("open");
    gate.setAttribute("aria-hidden", "false");
  };

  const dismiss = () => {
    gate.classList.remove("open");
    gate.setAttribute("aria-hidden", "true");
  };

  const proceed = (cityId) => {
    markSeen(cityId);
    dismiss();
  };

  let _scheduleTimer = null;
  const scheduleFor = (cityId) => {
    if (_scheduleTimer) clearTimeout(_scheduleTimer);
    if (getSeen().includes(cityId)) return;
    if (localStorage.getItem("clvch_email")) { markSeen(cityId); return; }
    _scheduleTimer = setTimeout(() => open(cityId), 20000);
  };
  const cancelSchedule = () => {
    if (_scheduleTimer) { clearTimeout(_scheduleTimer); _scheduleTimer = null; }
  };
  window.CLVCH.cityGate = { scheduleFor, cancelSchedule };

  const showSuccess = (msg, cityId) => {
    card.innerHTML = `
      <button class="citygate-close" id="cityGateClose2" aria-label="Close">✕</button>
      <div class="citygate-eyebrow">You're on the list</div>
      <h3>Welcome.</h3>
      <div class="citygate-success">${msg}</div>
      <button class="citygate-skip" id="cityGateContinue">Step inside →</button>
    `;
    document.getElementById("cityGateClose2").addEventListener("click", () => proceed(cityId));
    document.getElementById("cityGateContinue").addEventListener("click", () => proceed(cityId));
  };

  function rebind() {
    const close2 = card.querySelector(".citygate-close");
    const skip2 = card.querySelector(".citygate-skip");
    const form2 = card.querySelector("#cityGateForm");
    const input2 = card.querySelector("#cityGateEmail");

    const currentCity = (cityLabel.textContent || "").split("·")[1]?.trim().toLowerCase() || "";
    const cityObj = window.CLVCH.locations.find(l => l.city.toLowerCase() === currentCity);
    const cityId = cityObj ? cityObj.id : null;

    if (close2) close2.addEventListener("click", () => { if (cityId) markSeen(cityId); dismiss(); });
    if (skip2) skip2.addEventListener("click", () => { if (cityId) proceed(cityId); else dismiss(); });
    if (form2) {
      form2.addEventListener("submit", (e) => {
        e.preventDefault();
        const val = input2?.value.trim();
        if (!val) return;
        markEmail(val);
        showSuccess(`We'll write when the list drops in ${cityObj ? cityObj.city : "your city"}.`, cityId);
      });
    }
  }

  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && gate.classList.contains("open")) dismiss(); });
})();

/* ═══ Nav ticker — populated from window.CLVCH.locations so it grows as cities are added ═══ */
(function navTicker() {
  const track = document.getElementById("navTickerTrack");
  if (!track) return;

  function statusLine(l) {
    const city = (l.city || "").toUpperCase();
    if (l.status === "open") {
      return `● ${city} · OPEN`;
    }
    if (l.status === "prep") {
      return `● ${city} · ${(l.tonight || "OPENS LATER").toUpperCase()}`;
    }
    // soon / coming
    return `● ${city} · ${(l.tonight || "COMING SOON").toUpperCase()}`;
  }

  function tonightLine(l) {
    if (!l.tonight || l.status !== "open") return null;
    return `● ${(l.city || "").toUpperCase()} · ${l.tonight.toUpperCase()}`;
  }

  function render() {
    const locs = (window.CLVCH && window.CLVCH.locations) || [];
    const countEl = document.getElementById("navLocationsCount");
    if (countEl) countEl.textContent = String(locs.length).padStart(2, "0");
    if (!locs.length) { track.innerHTML = ""; return; }

    const lines = [];
    locs.forEach(l => lines.push(statusLine(l)));
    locs.forEach(l => { const t = tonightLine(l); if (t) lines.push(t); });

    // Duplicate the sequence so the CSS marquee loops seamlessly.
    // For a single city we repeat more times so the track has enough width to scroll.
    const reps = locs.length === 1 ? 6 : locs.length <= 3 ? 3 : 2;
    const all = [];
    for (let i = 0; i < reps; i++) all.push(...lines);
    track.innerHTML = all.map(s => `<span>${s}</span>`).join("");
  }

  render();

  // Re-render whenever the admin page mutates locations (storage event from another tab,
  // or a custom 'clvch:locations-changed' event dispatched by admin code).
  window.addEventListener("clvch:locations-changed", render);
  window.addEventListener("storage", (e) => {
    if (e.key && e.key.startsWith("clvch_")) render();
  });
})();

/* ═══ Age gate / Alcohol notice ═══ */
(function ageGate() {
  const gate = document.getElementById("ageGate");
  if (!gate) return;
  const KEY = "clvch_age_ok";
  const ok = (() => { try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; } })();
  if (ok) { gate.style.display = "none"; return; }

  gate.style.display = "flex";
  requestAnimationFrame(() => gate.classList.add("open"));

  document.getElementById("ageYes")?.addEventListener("click", () => {
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    gate.classList.add("out");
    setTimeout(() => { gate.style.display = "none"; gate.classList.remove("open","out"); }, 420);
  });

  document.getElementById("ageNo")?.addEventListener("click", () => {
    const card = gate.querySelector(".agegate-card");
    if (card) card.innerHTML = `
      <div class="agegate-logo">CLVCH</div>
      <h2>Come back<br>when you're <em>ready.</em></h2>
      <p style="color:var(--bone-muted);line-height:1.75;margin-top:20px;font-size:15px;">This site contains content about alcoholic beverages. Please visit when you meet the legal drinking age requirement in your jurisdiction.</p>
    `;
  });
})();

/* ═══ Mobile nav hamburger ═══ */
(function mobileNav() {
  const hamburger = document.getElementById("navHamburger");
  const navLinks = document.querySelector(".nav-links");
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      navLinks.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("click", (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
})();
