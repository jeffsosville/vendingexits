// lib/vendingCategories.ts
//
// Single source of truth for VendingExits sub-categories.
// Used by both the /api/listings route (server-side filtering + counts)
// and the CategoryTabs UI component.
//
// MATCHING MODEL: each listing is assigned to exactly ONE category — the
// first match in the order below (priority order). Keeps header counts honest.
//
// POSTGREST SAFETY: the .or() filter values are built WITHOUT double quotes
// and WITHOUT reserved characters (& ( ) , "). Patterns use only letters,
// spaces, and the % wildcard, which PostgREST accepts unquoted. Short
// ambiguous tokens (ice, air, vac) are space-anchored (e.g. "% ice%") so they
// don't substring-match "service"/"repair"/"vacation".
//
// MIGRATION NOTE: when you backfill a real `category_id` column, swap the
// keyword .or() for .eq('category_id', id). The UI does not change.

export interface VendingKeyword {
  /** Lowercased term. Letters/spaces only — NO &, hyphens, commas, quotes. */
  term: string;
  /** Space-anchor short ambiguous terms to force whole-word-ish matching. */
  anchor?: boolean;
}

export interface VendingCategory {
  id: string;
  name: string;
  emoji: string;
  keywords: VendingKeyword[];
}

const kw = (term: string, anchor = false): VendingKeyword => ({ term, anchor });

// Order = priority (most specific first).
export const VENDING_CATEGORIES: VendingCategory[] = [
  {
    id: 'water-ice',
    name: 'Water & Ice',
    emoji: '💧',
    keywords: [
      kw('ice vending'), kw('ice machine'), kw('ice house'), kw('filtered water'),
      kw('bagged ice'), kw('water vending'), kw('water store'),
      kw('ice', true), kw('water', true),
    ],
  },
  {
    id: 'air-vac',
    name: 'Air & Vac',
    emoji: '🌬️',
    keywords: [
      kw('air vac'), kw('tire inflation'), kw('air machine'), kw('vacuum'),
      kw('vac', true),
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
      kw('bulk'), kw('gumball'), kw('gum ball'), kw('capsule'),
      kw('sticker'), kw('bouncy ball'), kw('candy machine'), kw('toy', true),
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
      kw('industrial'), kw('locker'), kw('parcel'), kw('automated'),
      kw('tool crib'), kw('warehouse'), kw('amusement'), kw('arcade'),
      kw('coin operated'), kw('ppe', true), kw('mro', true), kw('b2b', true),
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

/**
 * Sanitize a term to letters/spaces only, collapse whitespace.
 * Strips anything that could break PostgREST's or() grammar.
 */
function sanitize(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Build the ilike VALUE (no column, no quotes) for one keyword. */
function ilikeValue(k: VendingKeyword): string {
  const safe = sanitize(k.term);
  if (!safe) return '';
  // anchor: space on BOTH sides → whole-word match without quotes.
  // e.g. "% vac %" matches " vac " but not " vacation" or "service".
  // Trade-off: won't match a term at the very start/end of a field, but
  // vending listing text effectively always has surrounding words.
  return k.anchor ? `% ${safe} %` : `%${safe}%`;
}

/**
 * Build the Supabase `.or()` filter string for a category.
 * Output contains NO quotes and NO reserved chars — only
 * `col.ilike.%value%` clauses joined by commas. PostgREST-safe.
 */
export function categoryOrFilter(categoryId: string): string | null {
  const cat = VENDING_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return null;
  const cols = ['title', 'description', 'business_type', 'category'];
  const clauses: string[] = [];
  for (const k of cat.keywords) {
    const val = ilikeValue(k);
    if (!val) continue;
    for (const col of cols) {
      clauses.push(`${col}.ilike.${val}`);
    }
  }
  return clauses.length ? clauses.join(',') : null;
}

/**
 * Client-side classifier mirroring the server logic. Used for the future
 * category_id backfill and any client tagging.
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
  const padded = ` ${hay} `;

  for (const cat of VENDING_CATEGORIES) {
    for (const k of cat.keywords) {
      const term = sanitize(k.term);
      const matched = k.anchor
        ? padded.includes(` ${term} `)
        : hay.includes(term);
      if (matched) return cat.id;
    }
  }
  return null;
}
