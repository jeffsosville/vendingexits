//pages/listing/[id].tsx
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { createClient } from '@supabase/supabase-js';

type Listing = {
  id: string;
  listing_id: string;
  title: string | null;
  price: number | null;
  cash_flow: number | null;
  city: string | null;
  state: string | null;
  category: string | null;
  listing_url: string;
  broker_account: string | null;
  quality_score: number | null;
  days_on_market: number | null;
  listing_views: number | null;
  estimated_listed_date: string | null;
  first_seen: string | null;
  scraped_at: string | null;
};

const money = (n?: number | null) =>
  n == null ? '—' : n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return { notFound: true };

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('vending_listings_merge')
    .select('*')
    .eq('listing_id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) return { notFound: true };

  const listing: Listing = {
    id: data.listing_id,
    listing_id: data.listing_id,
    title: data.title,
    price: data.price,
    cash_flow: data.cash_flow,
    city: data.city,
    state: data.state,
    category: data.category,
    listing_url: data.listing_url || '#',
    broker_account: data.broker_account,
    quality_score: data.quality_score,
    days_on_market: data.days_on_market,
    listing_views: data.listing_views,
    estimated_listed_date: data.estimated_listed_date,
    first_seen: data.first_seen,
    scraped_at: data.scraped_at,
  };

  return { props: { listing } };
};

export default function ListingDetail({ listing }: { listing: Listing }) {
  const locationLabel =
    listing.city && listing.state ? `${listing.city}, ${listing.state}` :
    listing.state || listing.city || '—';

  const listedDate = listing.estimated_listed_date || listing.first_seen;
  const hasMarketIntel =
    listing.days_on_market != null || listing.listing_views != null ||
    listing.quality_score != null || listedDate;

  return (
    <>
      <Head>
        <title>{listing.title || 'Vending Business'} | Vending Exits</title>
        <meta name="description" content={(listing.title || 'Vending machine business for sale').substring(0, 160)} />
        <link rel="canonical" href={`https://vendingexits.com/listing/${listing.id}`} />
        <meta property="og:title" content={listing.title || 'Vending Business'} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://vendingexits.com/listing/${listing.id}`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link href="/listings" className="text-amber-600 hover:text-amber-700 font-semibold">
              ← Back to Vending Exits
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {listing.title || 'Vending Machine Business'}
              </h1>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">Price</div>
                  <div className="text-xl font-bold text-gray-900">
                    {listing.price ? money(listing.price) : 'Contact'}
                  </div>
                </div>
                {listing.cash_flow != null && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-sm text-gray-600">Cash Flow (SDE)</div>
                    <div className="text-xl font-bold text-emerald-600">{money(listing.cash_flow)}</div>
                  </div>
                )}
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-sm text-gray-600">Location</div>
                  <div className="text-lg font-bold text-gray-900">{locationLabel}</div>
                </div>
              </div>

              {/* Market Intelligence */}
              {hasMarketIntel && (
                <div className="bg-white p-6 rounded-lg border">
                  <h2 className="font-bold text-gray-900 mb-4 text-lg">Market Intelligence</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {listing.days_on_market != null && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Days on Market</div>
                        <div className="text-2xl font-bold text-gray-900">{listing.days_on_market}d</div>
                      </div>
                    )}
                    {listing.listing_views != null && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Buyer Views</div>
                        <div className="text-2xl font-bold text-amber-600">👁 {listing.listing_views.toLocaleString()}</div>
                      </div>
                    )}
                    {listedDate && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Listed</div>
                        <div className="text-lg font-bold text-gray-900">{fmtDate(listedDate)}</div>
                      </div>
                    )}
                    {listing.quality_score != null && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Quality Score</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {listing.quality_score}<span className="text-base text-gray-400">/100</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Sourced from DealLedger — buyer view counts and DOM are not available on most marketplaces.
                  </p>
                </div>
              )}

              {listing.broker_account && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Listed by</div>
                  <div className="font-bold text-gray-900">{listing.broker_account}</div>
                </div>
              )}

              {listing.scraped_at && (
                <div className="text-sm text-gray-500 text-center">
                  Verified on {new Date(listing.scraped_at).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Right Column - direct to source, no email capture */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border-2 border-emerald-200 p-6 sticky top-6">
                <h3 className="font-bold text-gray-900 mb-2 text-xl">Interested in this listing?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Contact the broker on the marketplace — no signup required.
                </p>

                <a
                  href={listing.listing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition mb-4"
                >
                  View on BizBuySell →
                </a>

                {listing.broker_account && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-600 mb-1">Listed by</div>
                    <div className="font-semibold text-gray-900">{listing.broker_account}</div>
                  </div>
                )}

                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2"><span className="text-emerald-600">✓</span><span>No account required</span></li>
                  <li className="flex items-start gap-2"><span className="text-emerald-600">✓</span><span>No email capture</span></li>
                  <li className="flex items-start gap-2"><span className="text-emerald-600">✓</span><span>Direct to broker</span></li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
