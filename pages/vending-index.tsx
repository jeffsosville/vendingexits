// pages/vending-index.tsx
import Head from "next/head";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { GetServerSideProps } from "next";

type Listing = {
  listing_id: string | null;
  title: string | null;
  city: string | null;
  state: string | null;
  location: string | null;
  price: number | null;
  cash_flow: number | null;
  revenue: number | null;
  description: string | null;
  listing_url: string | null;
  broker_account: string | null;
  scraped_at: string | null;
};

type Props = {
  listings: Listing[];
  totalCount: number;
  hadError: boolean;
  errMsg: string | null;
};

const money = (n?: number | null) =>
  n == null
    ? "—"
    : n.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      });

export const getServerSideProps: GetServerSideProps = async () => {
  // Initialize Supabase in getServerSideProps, not at module level
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      props: {
        listings: [],
        totalCount: 0,
        hadError: true,
        errMsg: "Service configuration error"
      }
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get total count for vending industry
  const { count } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq('industry', 'vending')
    .eq('is_active', true);

  // Get all vending listings
  const { data, error } = await supabase
    .from("listings")
    .select("listing_id, title, city, state, location, price, cash_flow, revenue, description, listing_url, broker_account, scraped_at")
    .eq('industry', 'vending')
    .eq('is_active', true)
    .order("scraped_at", { ascending: false })
    .limit(1000);

  if (error || !data) {
    return { 
      props: { 
        listings: [], 
        totalCount: 0,
        hadError: true, 
        errMsg: error?.message ?? "Query failed" 
      } 
    };
  }

  const listings = data.map((r) => ({
    listing_id: r.listing_id ?? null,
    title: r.title ?? null,
    city: r.city ?? null,
    state: r.state ?? null,
    location: r.location ?? null,
    price: r.price ?? null,
    cash_flow: r.cash_flow ?? null,
    revenue: r.revenue ?? null,
    description: r.description ?? null,
    listing_url: r.listing_url ?? null,
    broker_account: r.broker_account ?? null,
    scraped_at: r.scraped_at ?? null,
  }));

  return { 
    props: { 
      listings, 
      totalCount: count ?? 0,
      hadError: false, 
      errMsg: null 
    } 
  };
};

export default function VendingIndex({ listings, totalCount, hadError, errMsg }: Props) {
  return (
    <>
      <Head>
        <title>Vending Machine Business Listings | VendingExits</title>
        <meta
          name="description"
          content="Complete index of vending machine business listings. Browse all verified vending portfolios for sale."
        />
      </Head>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-3 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Vending Machine Business Index
          </h1>
          <p className="text-gray-600 text-lg">
            Complete database of {totalCount.toLocaleString()} verified vending portfolios
          </p>
        </header>

        {/* Error state */}
        {hadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
            <strong>Error loading listings:</strong> {errMsg}
          </div>
        )}

        {/* Listings */}
        {!hadError && listings.length === 0 && (
          <div className="rounded-lg border p-6 text-gray-600">
            No listings found. Check back soon!
          </div>
        )}

        {!hadError && listings.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-500">
              Showing {listings.length.toLocaleString()} of {totalCount.toLocaleString()} listings
              {listings.length < totalCount && " (pagination coming soon)"}
            </div>

            <div className="space-y-4">
              {listings.map((listing) => {
                const multiple = listing.cash_flow && listing.price 
                  ? (listing.price / listing.cash_flow).toFixed(1)
                  : null;

                return (
                  <div
                    key={listing.listing_id}
                    className="rounded-lg border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                          <Link
                            href={listing.listing_id ? `/listing/${listing.listing_id}` : listing.listing_url ?? "#"}
                            className="text-lg font-semibold hover:underline text-gray-900"
                          >
                            {listing.title ?? "Untitled Vending Portfolio"}
                          </Link>
                          {(listing.city || listing.state) && (
                            <span className="text-sm text-gray-500">
                              {listing.city ? `${listing.city}, ` : ""}
                              {listing.state ?? ""}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                          <span className="font-semibold text-gray-900">
                            {money(listing.price)}
                          </span>
                          {listing.cash_flow && (
                            <>
                              <span>SDE {money(listing.cash_flow)}</span>
                              {multiple && (
                                <span className="text-gray-500">
                                  {multiple}x multiple
                                </span>
                              )}
                            </>
                          )}
                          {listing.revenue && (
                            <span>Revenue {money(listing.revenue)}</span>
                          )}
                        </div>

                        {listing.description && (
                          <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                            {listing.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                          {listing.broker_account && (
                            <span>via {listing.broker_account}</span>
                          )}
                          {listing.scraped_at && (
                            <span>
                              Added {new Date(listing.scraped_at).toLocaleDateString()}
                            </span>
                          )}
                          {listing.listing_url && (
                            <a
                              href={listing.listing_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View original →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <footer className="mt-12 text-center text-sm text-gray-500">
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </footer>
      </main>
    </>
  );
}


