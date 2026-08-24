import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  VENDING_CATEGORIES,
  categoryOrFilter,
} from '@/lib/vendingCategories';
import { getOurListings, filterOurListings } from '@/data/ourListings';

/**
 * listings_direct stores `state` as a 2-letter code. Users type "Colorado",
 * "CO", or "Longmont, CO". Resolve any of those to a code so the filter works.
 */
const US_STATES: Record<string, string> = {
  alabama:'AL', alaska:'AK', arizona:'AZ', arkansas:'AR', california:'CA',
  colorado:'CO', connecticut:'CT', delaware:'DE', florida:'FL', georgia:'GA',
  hawaii:'HI', idaho:'ID', illinois:'IL', indiana:'IN', iowa:'IA',
  kansas:'KS', kentucky:'KY', louisiana:'LA', maine:'ME', maryland:'MD',
  massachusetts:'MA', michigan:'MI', minnesota:'MN', mississippi:'MS',
  missouri:'MO', montana:'MT', nebraska:'NE', nevada:'NV',
  'new hampshire':'NH', 'new jersey':'NJ', 'new mexico':'NM', 'new york':'NY',
  'north carolina':'NC', 'north dakota':'ND', ohio:'OH', oklahoma:'OK',
  oregon:'OR', pennsylvania:'PA', 'rhode island':'RI', 'south carolina':'SC',
  'south dakota':'SD', tennessee:'TN', texas:'TX', utah:'UT', vermont:'VT',
  virginia:'VA', washington:'WA', 'west virginia':'WV', wisconsin:'WI',
  wyoming:'WY', 'district of columbia':'DC',
};
const STATE_CODES = new Set(Object.values(US_STATES));

function resolveState(input: string): string | null {
  const s = input.trim().toLowerCase();
  if (!s) return null;
  if (s.length === 2 && STATE_CODES.has(s.toUpperCase())) return s.toUpperCase();
  return US_STATES[s] ?? null;
}

const SORT_COLUMNS: Record<string, string> = {
  ingested_at: 'first_seen',
  scraped_at:  'scraped_at',
  price:       'price',
  cash_flow:   'cash_flow',
};

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Service configuration error' }, { status: 503 });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);

    // ---- counts mode: return total + per-category counts for the tab badges ----
    if (searchParams.get('counts') === 'true') {
      const base = () =>
        supabase
          .from('vending_listings_merge')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

      const { count: allCount } = await base();

      const categoryCounts: Record<string, number> = {};
      await Promise.all(
        VENDING_CATEGORIES.map(async (cat) => {
          const orFilter = categoryOrFilter(cat.id);
          let q = base();
          if (orFilter) q = q.or(orFilter);
          const { count } = await q;
          categoryCounts[cat.id] = count || 0;
        })
      );

      return NextResponse.json({
        all: (allCount || 0) + (await getOurListings()).length,
        categories: categoryCounts,
      });
    }

    // ---- normal listing mode ----
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.max(parseInt(searchParams.get('limit') || '20'), 1);
    const search = searchParams.get('search') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const location = searchParams.get('location');
    const category = searchParams.get('category') || '';
    const sortByRaw = searchParams.get('sortBy') || '';
    const sortOrder = searchParams.get('sortOrder') === 'asc';

    const sortCol = SORT_COLUMNS[sortByRaw] || 'first_seen';
    const offset = (page - 1) * limit;

    let query = supabase
      .from('vending_listings_merge')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Category filter (Option A: keyword match across text columns).
    // When a real category_id column is backfilled, replace this block with:
    //   if (category && category !== 'all') query = query.eq('category_id', category);
    //
    // NOTE: only ONE top-level .or() can be used per query — PostgREST merges
    // multiple .or() calls into a single OR group rather than ANDing them.
    // So the category uses .or(), and search is applied as ANDed .ilike filters.
    if (category && category !== 'all') {
      const orFilter = categoryOrFilter(category);
      if (orFilter) query = query.or(orFilter);
    }

    if (search) {
      const safeSearch = search.replace(/[^a-zA-Z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
      if (safeSearch) {
        if (category && category !== 'all') {
          // category already used .or(); AND the search via a single .ilike
          // (a 2nd .or() would merge into one OR, not AND). No quotes needed.
          query = query.ilike('title', `%${safeSearch}%`);
        } else {
          // Use * wildcards (not %) inside .or() to avoid URL-encoding 500s.
          // NOTE: no `location` column exists, and `description` is null on
          // every row from listings_direct. Match title / city / state.
          const clauses = [
            `title.ilike.*${safeSearch}*`,
            `city.ilike.*${safeSearch}*`,
            `state.ilike.*${safeSearch}*`,
          ];
          // "Colorado" should find CO rows even though only the code is stored.
          const st = resolveState(search);
          if (st) clauses.push(`state.ilike.${st}`);
          query = query.or(clauses.join(','));
        }
      }
    }
    if (minPrice) query = query.gte('price', parseInt(minPrice));
    if (maxPrice) query = query.lte('price', parseInt(maxPrice));
    if (location) {
      // No `location` column exists — city and state are separate.
      // Accepts "CO", "Colorado", "Longmont", or "Longmont, CO".
      const raw = location.trim();
      const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);

      if (parts.length >= 2) {
        // "City, ST" — filter both, AND'd. No .or() needed.
        const st = resolveState(parts[parts.length - 1]);
        query = query.ilike('city', `%${parts[0]}%`);
        if (st) query = query.ilike('state', st);
      } else {
        const st = resolveState(raw);
        if (st) query = query.ilike('state', st);
        else query = query.ilike('city', `%${raw}%`);
      }
    }

    query = query
      .order(sortCol, { ascending: sortOrder, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
    }

    const warehouseListings = (data || []).map((r: any) => ({
      ...r,
      id: r.listing_id,
      header: r.title,            // ListingCard reads `header`
      cashFlow: r.cash_flow,      // card reads camelCase `cashFlow`
      recentlyAdded: false,
      source: 'warehouse',
    }));

    // ---- in-house listings ----
    // Our own brokered listings live in git (data/ourListings.ts), not in the
    // DealLedger warehouse. They are pinned to the top of page 1 so they lead
    // the grid, and they respect the same search / price / location filters.
    // Category tabs are keyword-matched against warehouse columns, so we only
    // inject when no specific category tab is active.
    const showOurs = !category || category === 'all';
    const ourListings = showOurs
      ? filterOurListings(await getOurListings(), { search, minPrice, maxPrice, location })
      : [];

    const listings =
      page === 1 ? [...ourListings, ...warehouseListings] : warehouseListings;

    const total = (count || 0) + ourListings.length;
    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({
      listings,
      pagination: {
        page, limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
