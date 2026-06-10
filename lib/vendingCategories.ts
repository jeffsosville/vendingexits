// lib/vendingCategories.ts
//
// Single source of truth for VendingExits sub-categories.
// Used by both the /api/listings route (server-side filtering + counts)
// and the CategoryTabs UI component.
//
// MATCHING MODEL: each listing is assigned to exactly ONE category — the
// first match in the order below (priority order). This keeps header counts
// honest and avoids double-counting, matching how CleaningExits buckets work.
//
// MIGRATION NOTE: today these match against the freeform title/description/
// business_type/category text at query time (Option A). When you backfill a
// real `category_id` column on vending_listings_merge, swap the keyword
// `.or()` clause for `.eq('category_id', id)` and the counts query for a
// grouped count — the UI does not change.

export interface VendingKeyword {
  /** The term to search for (lowercased). */
  term: string;
  /**
   * If true, match the term as a whole word (space-padded) to avoid
   * substring false positives like "ice" in "service" or "air" in "repair".
   * Use for short/ambiguous terms. Long distinctive terms can leave this off.
   */
  wholeWord?: boolean;
}

export interface VendingCategory {
  /** Stable id — also the value passed as ?category= and the future column value */
  id: string;
  /** Tab label shown to users */
  name: string;
  /** Emoji shown in the tab pill */
  emoji: string;
  /** Keywords; a listing matches the category if any keyword matches its text */
  keywords: VendingKeyword[];
}

// Helper to keep the category table readable.
const kw = (term: string, wholeWord = false): VendingKeyword => ({ term, wholeWord });

// Order = priority. Most specific / least ambiguous buckets should come
// BEFORE broad ones so a listing lands in the most meaningful tab.
export const VENDING_CATEGORIES: VendingCategory[] = [
  {
    id: 'water-ice',
    name: 'Water & Ice',
    emoji: '💧',
    keywords: [
      kw('ice vending'), kw('ice machine'), kw('ice house'), kw('filtered water'),
      kw('bagged ice'), kw('bulk ice'), kw('water vending'), kw('water store'),
      kw('ice', true), kw('water', true),
    ],
  },
  {
    id: 'air-vac',
    name: 'Air & Vac',
    emoji: '🌬️',
    keywords: [
      kw('air and vac'), kw('air vac'), kw('tire inflation'), kw('air machine'),
      kw('car wash air'), kw('coin-op vacuum'), kw('vacuum'),
      kw('vac', true),
    ],
  },
  {
    id: 'healthy-food',
    name: 'Healthy Food',
    emoji: '🥗',
    keywords: [
      kw('healthy'), kw('fresh food'), kw('salad'), kw('micro market'),
      kw('micromarket'), kw('micro-market'), kw('kombucha'), kw('protein'),
      kw('wellness'), kw('fresh-food'),
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
      kw('coin-op'), kw('coin operated'), kw('ppe', true), kw('mro', true),
      kw('b2b', true),
    ],
  },
  {
    id: 'snack-beverage',
    name: 'Snack & Beverage',
    emoji: '🥤',
    keywords: [
      kw('snack'), kw('beverage'), kw('soda'), kw('drink'), kw('combo'),
      kw('coffee'), kw('food vending'), kw('candy'), kw('chips'),
      kw('full-line'), kw('full line'),
    ],
  },
];

export const VENDING_CATEGORY_IDS = VENDING_CATEGORIES.map((c) => c.id);

/**
 * Turn one keyword into an ilike pattern, sanitized + quoted for PostgREST.
 *
 * PostgREST `.or()` grammar notes:
 *   - clauses are comma-separated; a comma in a value breaks parsing
 *   - `&`, `(`, `)`, `"` are reserved in the logic-tree parser
 *   - values with spaces or reserved chars MUST be double-quoted
 * So we strip reserved chars and always emit a quoted pattern.
 * wholeWord terms are space-padded so "ice" doesn't match "service".
 */
function ilikePattern(term: string, wholeWord: boolean): string {
  const safe = term
    .replace(/[%,&()"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!safe) return '';
  return wholeWord ? `% ${safe} %` : `%${safe}%`;
}

/**
 * Build the Supabase `.or()` filter string for a single category's keywords,
 * matched across the searchable text columns. Used server-side.
 *
 * Produces e.g.:
 *   title.ilike."%snack%",description.ilike."%snack%",...
 */
export function categoryOrFilter(categoryId: string): string | null {
  const cat = VENDING_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return null;
  const cols = ['title', 'description', 'business_type', 'category'];
  const clauses: string[] = [];
  for (const k of cat.keywords) {
    const pat = ilikePattern(k.term, !!k.wholeWord);
    if (!pat) continue;
    for (const col of cols) {
      clauses.push(`${col}.ilike."${pat}"`);
    }
  }
  return clauses.length ? clauses.join(',') : null;
}

/**
 * Client-side equivalent: assign a listing to its first-matching category id,
 * or null if none match. Used for the future backfill and any client tagging.
 * Mirrors the server's wholeWord vs substring logic.
 */
export function classifyListing(listing: {
  title?: string | null;
  description?: string | null;
  business_type?: string | null;
  category?: string | null;
}): string | null {
  const hay = [
    listing.title,
    listing.description,
    listing.business_type,
    listing.category,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (!hay) return null;
  const padded = ` ${hay} `;

  for (const cat of VENDING_CATEGORIES) {
    for (const k of cat.keywords) {
      const term = k.term.toLowerCase();
      const matched = k.wholeWord
        ? padded.includes(` ${term} `)
        : hay.includes(term);
      if (matched) return cat.id;
    }
  }
  return null;
}
