import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.max(parseInt(searchParams.get('limit') || '20'), 1);
    const search = searchParams.get('search') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const location = searchParams.get('location');
    const sortByRaw = searchParams.get('sortBy') || '';
    const sortOrder = searchParams.get('sortOrder') === 'asc';

    const sortCol = SORT_COLUMNS[sortByRaw] || 'first_seen';
    const offset = (page - 1) * limit;

    let query = supabase
      .from('vending_listings_merge')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%`);
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

    const listings = (data || []).map((r: any) => ({ ...r, id: r.listing_id }));

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
