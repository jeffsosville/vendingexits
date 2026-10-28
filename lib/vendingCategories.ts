// lib/vendingCategories.ts
//
// Single source of truth for VendingExits groups. Used by /api/listings
// (tab filtering + counts), the homepage "Browse by type" row, and CategoryTabs.
//
// MATCHING MODEL
//   - Each listing gets exactly ONE group: the first group in priority order
//     with a matching phrase. Counts across groups add up to the total.
//   - Phrases match on whole words (" ice " never matches "service";
//     "air vac" never matches "repair ... vacation").
//   - Title is checked first; the description is only used when the title
//     names no group. Scraped descriptions often carry "Related Posts" lists
//     of OTHER routes, so everything after those markers is ignored.
//   - A generic "vending route" with no type falls into Snack & Beverage —
//     that's what the industry means by a traditional route.
//   - Distribution (DSD) routes — tortilla, bread, wholesale snack — aren't
//     vending. They get their own bucket so they don't inflate vending groups.
//
// Classification runs in JS (not PostgREST .or()), so the API reads
// id/title/description for active rows and filters by listing_id.

export interface VendingCategory {
  id: string;
  name: string;
  emoji: string;
  /** One line for the homepage card. */
  blurb: string;
  /** Lowercase phrases, letters/digits/spaces only. */
  phrases: string[];
  /** Vending group shown on the homepage. false = index tab only. */
  vending: boolean;
}

// Order = classification priority (most specific first).
const PRIORITY: VendingCategory[] = [
  {
    id: 'delivery',
    name: 'Delivery Routes',
    emoji: '🚚',
    blurb: 'Bread, tortilla and wholesale snack distribution routes.',
    vending: false,
    phrases: [
      'tortilla', 'mission route', 'mission foods', 'bread route', 'bakery',
      'bimbo', 'pepperidge', 'tastykake', 'entenmann', 'utz', 'dsd route',
      'wholesale', 'distribution route', 'delivery route', 'mountain man',
      'pool route',
    ],
  },
  {
    id: 'air-vac',
    name: 'Air & Vac',
    emoji: '🌬️',
    blurb: 'Tire inflation and vacuum machines at gas stations and car washes.',
    vending: true,
    phrases: [
      'air vac', 'air and vac', 'air vacuum', 'tire inflation', 'tire air',
      'air machine', 'air machines', 'air pump', 'air pumps', 'car vacuum',
      'coin op vacuum', 'vacuum machine', 'vacuum machines', 'car wash vacuum',
    ],
  },
  {
    id: 'micro-market',
    name: 'Micro Markets & Coffee',
    emoji: '🏬',
    blurb: 'Self-checkout markets, smart coolers and office coffee service.',
    vending: true,
    phrases: [
      'micro market', 'micro markets', 'micromarket', 'micromarkets',
      'smart cooler', 'smart coolers', 'smart fridge', 'smart fridges',
      'office coffee', 'pantry service', 'self checkout', 'unattended retail',
    ],
  },
  {
    id: 'water-ice',
    name: 'Water & Ice',
    emoji: '💧',
    blurb: 'Water refill stations and bagged-ice vending.',
    vending: true,
    phrases: [
      'water vending', 'water machine', 'water machines', 'water refill',
      'water station', 'water stations', 'water store', 'ice vending',
      'ice machine', 'ice machines', 'ice house', 'bagged ice', 'bulk ice',
    ],
  },
  {
    id: 'bulk',
    name: 'Bulk',
    emoji: '🍬',
    blurb: 'Gumball, candy, capsule toy and sticker machines.',
    vending: true,
    phrases: [
      'bulk vending', 'bulk candy', 'gumball', 'gumballs', 'gum ball',
      'capsule', 'capsules', 'sticker', 'stickers', 'toy vending',
      'toys vending', 'collectible toy', 'candy machine', 'candy machines',
    ],
  },
  {
    id: 'amusement',
    name: 'Amusement',
    emoji: '🕹️',
    blurb: 'Claw machines, kiddie rides and arcade games.',
    vending: true,
    phrases: [
      'claw', 'claw machine', 'crane machine', 'arcade', 'amusement',
      'kiddie ride', 'kiddie rides', 'jukebox', 'skill game', 'skill games',
    ],
  },
  {
    id: 'specialty',
    name: 'Specialty & Healthy',
    emoji: '✨',
    blurb: 'Healthy food, cotton candy, electronics, PPE and lockers.',
    vending: true,
    phrases: [
      'healthy', 'health focused', 'fresh food', 'salad', 'cotton candy',
      'electronics', 'charger', 'chargers', 'ppe', 'locker', 'lockers',
      'industrial vending', 'cosmetic', 'beauty', 'flower', 'specialty vending',
    ],
  },
  {
    id: 'snack-beverage',
    name: 'Snack & Beverage',
    emoji: '🥤',
    blurb: 'Traditional soda, snack and combo routes — the core of vending.',
    vending: true,
    phrases: [
      'snack', 'snacks', 'soda', 'beverage', 'beverages', 'drink', 'drinks',
      'combo', 'candy', 'coffee vending', 'food vending', 'full line',
      'soft drinks',
      // generic fallback: a vending route with no stated type
      'vending', 'vending route', 'vending machine', 'vending machines',
    ],
  },
];

/** Display order: traditional first, then the rest; non-vending last. */
const DISPLAY_ORDER = [
  'snack-beverage', 'micro-market', 'bulk', 'water-ice', 'air-vac',
  'amusement', 'specialty', 'delivery',
];

export const VENDING_CATEGORIES: VendingCategory[] = DISPLAY_ORDER.map(
  (id) => PRIORITY.find((c) => c.id === id)!
);

export const VENDING_CATEGORY_IDS = VENDING_CATEGORIES.map((c) => c.id);

function sanitize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Drop "Related Posts" / "Recent Posts" lists of other listings. */
function stripRelated(desc: string): string {
  const cut = desc.search(/related posts|recent posts|routes by state/i);
  return cut >= 0 ? desc.slice(0, cut) : desc;
}

function firstMatch(text: string): string | null {
  const hay = ` ${sanitize(text)} `;
  if (hay.trim() === '') return null;
  for (const cat of PRIORITY) {
    for (const p of cat.phrases) {
      if (hay.includes(` ${p} `)) return cat.id;
    }
  }
  return null;
}

/** One group id per listing (title first, then description). */
export function classifyListing(listing: {
  title?: string | null;
  description?: string | null;
}): string | null {
  return (
    firstMatch(listing.title || '') ??
    firstMatch(stripRelated(listing.description || ''))
  );
}

/** Count per group for a set of listings. */
export function countByCategory(
  rows: { title?: string | null; description?: string | null }[]
): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(
    VENDING_CATEGORY_IDS.map((id) => [id, 0])
  );
  for (const r of rows) {
    const id = classifyListing(r);
    if (id) counts[id] += 1;
  }
  return counts;
}
