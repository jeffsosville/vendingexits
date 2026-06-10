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

export interface VendingCategory {
  /** Stable id — also the value passed as ?category= and the future column value */
  id: string;
  /** Tab label shown to users */
  name: string;
  /** Emoji shown in the tab pill */
  emoji: string;
  /** Lowercased keywords; a listing matches the category if any appears in its searchable text */
  keywords: string[];
}

// Order = priority. Most specific / least ambiguous buckets should come
// BEFORE broad ones so a listing lands in the most meaningful tab.
// (e.g. "healthy snack micro market" should be Healthy Food, not Snack & Beverage,
//  so Healthy Food is listed before Snack & Beverage.)
export const VENDING_CATEGORIES: VendingCategory[] = [
  {
    id: 'water-ice',
    name: 'Water & Ice',
    emoji: '💧',
    keywords: ['water', 'ice ', 'ice vending', 'ice machine', 'ice house', 'filtered water', 'bagged ice', 'bulk ice'],
  },
  {
    id: 'air-vac',
    name: 'Air & Vac',
    emoji: '🌬️',
    keywords: ['air & vac', 'air and vac', 'air vac', 'vacuum', ' vac ', 'tire inflation', 'air machine', 'car wash air', 'coin-op vacuum'],
  },
  {
    id: 'healthy-food',
    name: 'Healthy Food',
    emoji: '🥗',
    keywords: ['healthy', 'fresh food', 'salad', 'micro market', 'micromarket', 'micro-market', 'kombucha', 'protein', 'wellness', 'fresh-food'],
  },
  {
    id: 'bulk',
    name: 'Bulk',
    emoji: '🍬',
    keywords: ['bulk', 'gumball', 'gum ball', 'capsule', 'toy ', 'sticker', 'bouncy ball', 'candy machine'],
  },
  {
    id: 'specialty',
    name: 'Specialty & Luxury',
    emoji: '✨',
    keywords: ['specialty', 'luxury', 'electronics', 'charger', 'headphone', 'cosmetic', 'beauty', 'flower', 'fragrance', 'novelty'],
  },
  {
    id: 'industrial',
    name: 'Industrial & Automated',
    emoji: '🏭',
    keywords: ['industrial', 'ppe', 'locker', 'parcel', 'automated', 'tool crib', 'b2b', 'warehouse', 'mro', 'amusement', 'arcade', 'coin-op', 'coin operated'],
  },
  {
    id: 'snack-beverage',
    name: 'Snack & Beverage',
    emoji: '🥤',
    keywords: ['snack', 'beverage', 'soda', 'drink', 'combo', 'coffee', 'food vending', 'candy', 'chips', 'full-line', 'full line'],
  },
];

export const VENDING_CATEGORY_IDS = VENDING_CATEGORIES.map((c) => c.id);

/**
 * Build the Supabase `.or()` filter string for a single category's keywords,
 * matched across the searchable text columns. Used server-side.
 *
 * Produces e.g.:
 *   title.ilike.%snack%,description.ilike.%snack%,business_type.ilike.%snack%,category.ilike.%snack%,...
 */
export function categoryOrFilter(categoryId: string): string | null {
  const cat = VENDING_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return null;
  const cols = ['title', 'description', 'business_type', 'category'];
  const clauses: string[] = [];
  for (const kw of cat.keywords) {
    const safe = kw.replace(/[%,]/g, ' ').trim();
    if (!safe) continue;
    for (const col of cols) {
      clauses.push(`${col}.ilike.%${safe}%`);
    }
  }
  return clauses.join(',');
}

/**
 * Client-side equivalent: assign a listing to its first-matching category id,
 * or null if none match. Used as a fallback for counts when the API can't
 * group them and for any client-side tagging.
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

  for (const cat of VENDING_CATEGORIES) {
    if (cat.keywords.some((kw) => hay.includes(kw.toLowerCase()))) {
      return cat.id;
    }
  }
  return null;
}
