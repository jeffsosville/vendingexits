import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  VENDING_CATEGORIES,
  categoryOrFilter,
} from '@/lib/vendingCategories';

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

      return NextResponse.json({ all: allCount || 0, categories: categoryCounts });
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
          query = query.or(
            `title.ilike.*${safeSearch}*,location.ilike.*${safeSearch}*`
          );
        }
      }
    }
    if (minPrice) query = query.gte('price', parseInt(minPrice));
    if (maxPrice) query = query.lte('price', parseInt(maxPrice));
    if (location) query = query.ilike('location', `%${location}%`);

    query = query
      .order(sortCol, { ascending: sortOrder, nullsFirst: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 });
    }

    const listings = (data || []).map((r: any) => ({
      ...r,
      id: r.listing_id,
      header: r.title,            // ListingCard reads `header`
      cashFlow: r.cash_flow,      // card reads camelCase `cashFlow`
      recentlyAdded: false,
    }));

    const totalPages = Math.ceil((count || 0) / limit);
    return NextResponse.json({
      listings,
      pagination: {
        page, limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
