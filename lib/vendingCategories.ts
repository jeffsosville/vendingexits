// lib/vendingCategories.ts
//
// Single source of truth for VendingExits sub-categories.
// Used by both the /api/listings route (server-side filtering + counts)
// and the CategoryTabs UI component.
//
// MATCHING MODEL: each listing is assigned to exactly ONE category — the
// first match in priority order. Keeps header counts honest.
//
// POSTGREST SAFETY (the hard-won part):
//   - .or() filter VALUES use `*` as the wildcard, never `%`. Raw `%` in an
//     .or() string is not URL-encoded by the Supabase client and PostgREST
//     500s on it.
//   - Values contain NO literal spaces, NO quotes, NO &()" — a literal space
//     inside an unquoted .or() value also 500s. Multi-word terms join their
//     words with `*` (e.g. "gum ball" -> "*gum*ball*").
//   - We therefore avoid ultra-short ambiguous tokens (ice/vac/ppe) as bare
//     matches; they're covered by distinctive multi-word siblings instead.
//
// MIGRATION NOTE: when you backfill a real `category_id` column, swap the
// keyword .or() for .eq('category_id', id). The UI does not change.

export interface VendingKeyword {
  /** Lowercased term. Letters/digits/spaces only. */
  term: string;
}

export interface VendingCategory {
  id: string;
  name: string;
  emoji: string;
  keywords: VendingKeyword[];
}

const kw = (term: string): VendingKeyword => ({ term });

// Order = priority (most specific first).
export const VENDING_CATEGORIES: VendingCategory[] = [
  {
    id: 'water-ice',
    name: 'Water & Ice',
    emoji: '💧',
    keywords: [
      // "water" is safe as a substring in vending text. For "ice" we avoid
      // bare/leading forms because "service vending" contains "...ice vending".
      // The forms below cannot be hit by "service": "service" has no "machine",
      // "house", "cream", or "bagged/bulk" following the embedded "ice".
      kw('water'), kw('ice machine'), kw('ice house'),
      kw('bagged ice'), kw('bulk ice'), kw('ice cream'),
    ],
  },
  {
    id: 'air-vac',
    name: 'Air & Vac',
    emoji: '🌬️',
    keywords: [
      // bare "vac" dropped (matches "vacation"); "vacuum" + multiword cover it.
      kw('vacuum'), kw('air vac'), kw('air and vac'), kw('tire inflation'),
      kw('air machine'), kw('coin op vacuum'),
    ],
  },
  {
    id: 'healthy-food',
    name: 'Healthy Food',
    emoji: '🥗',
    keywords: [
      kw('healthy'), kw('fresh food'), kw('salad'), kw('micro market'),
      kw('micromarket'), kw('kombucha'), kw('protein'), kw('wellness'),
    ],
  },
  {
    id: 'bulk',
    name: 'Bulk',
    emoji: '🍬',
    keywords: [
      // bare "toy" dropped (too ambiguous); "candy machine"/"gumball" cover bulk.
      kw('bulk'), kw('gumball'), kw('gum ball'), kw('capsule'),
      kw('sticker'), kw('bouncy ball'), kw('candy machine'),
    ],
  },
  {
    id: 'specialty',
    name: 'Specialty & Luxury',
    emoji: '✨',
    keywords: [
      kw('specialty'), kw('luxury'), kw('electronics'), kw('charger'),
      kw('headphone'), kw('cosmetic'), kw('beauty'), kw('flower'),
      kw('fragrance'), kw('novelty'),
    ],
  },
  {
    id: 'industrial',
    name: 'Industrial & Automated',
    emoji: '🏭',
    keywords: [
      // bare "ppe"/"mro"/"b2b" dropped; distinctive terms cover the segment.
      kw('industrial'), kw('locker'), kw('parcel'), kw('automated'),
      kw('tool crib'), kw('warehouse'), kw('amusement'), kw('arcade'),
      kw('coin operated'),
    ],
  },
  {
    id: 'snack-beverage',
    name: 'Snack & Beverage',
    emoji: '🥤',
    keywords: [
      kw('snack'), kw('beverage'), kw('soda'), kw('drink'), kw('combo'),
      kw('coffee'), kw('food vending'), kw('candy'), kw('chips'),
      kw('full line'),
    ],
  },
];

export const VENDING_CATEGORY_IDS = VENDING_CATEGORIES.map((c) => c.id);

/** Sanitize to letters/digits/spaces only; collapse whitespace. */
function sanitize(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Build the ilike VALUE (no column, no quotes) for one keyword.
 * Uses `*` wildcards (never `%`) and contains NO literal spaces:
 * internal spaces become `*`. e.g. "gum ball" -> "*gum*ball*".
 */
function ilikeValue(term: string): string {
  const safe = sanitize(term);
  if (!safe) return '';
  return `*${safe.replace(/ /g, '*')}*`;
}

/**
 * Build the Supabase `.or()` filter string for a category.
 * Output: `col.ilike.*value*` clauses joined by commas. No %, no quotes,
 * no literal spaces, no reserved chars. PostgREST-safe.
 */
export function categoryOrFilter(categoryId: string): string | null {
  const cat = VENDING_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return null;
  // Only filter on columns that exist on vending_listings_merge.
  // (business_type / category are read by the detail page via select('*')
  // but do NOT exist as real columns — filtering on them errors 42703.)
  const cols = ['title', 'description'];
  const clauses: string[] = [];
  for (const k of cat.keywords) {
    const val = ilikeValue(k.term);
    if (!val) continue;
    for (const col of cols) {
      clauses.push(`${col}.ilike.${val}`);
    }
  }
  return clauses.length ? clauses.join(',') : null;
}

/**
 * Client-side classifier mirroring the server logic (substring match).
 * Used for the future category_id backfill and any client tagging.
 */
export function classifyListing(listing: {
  title?: string | null;
  description?: string | null;
  business_type?: string | null;
  category?: string | null;
}): string | null {
  const hay = sanitize(
    [listing.title, listing.description, listing.business_type, listing.category]
      .filter(Boolean)
      .join(' ')
  );
  if (!hay) return null;

  for (const cat of VENDING_CATEGORIES) {
    for (const k of cat.keywords) {
      const term = sanitize(k.term);
      if (term && hay.includes(term)) return cat.id;
    }
  }
  return null;
}
