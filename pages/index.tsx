import Head from "next/head";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Header from '../components/Header';
import Footer from '../components/Footer';
import InquiryForm from '../components/InquiryForm';
import { VENDING_CATEGORIES, countByCategory } from '../lib/vendingCategories';
import { getOurListings, getOurSoldListings, type OurListing } from '../data/ourListings';
import { brokerName } from '../lib/brokerName';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

type Top10 = {
  listing_id: string | null;
  title: string | null;
  city: string | null;
  state: string | null;
  price: number | null;
  revenue: number | null;
  cash_flow: number | null;
  listing_url: string | null;
  first_seen: string | null;
  days_on_market: number | null;
  broker: string | null;
};

type Ours = { id: string; title: string; price: number | null; cash_flow: number | null; location: string | null; status: string; ctaHref: string };
const toOurs = (l: OurListing): Ours => ({
  id: l.id, title: l.title, price: l.price, cash_flow: l.cash_flow, location: l.location, status: l.status, ctaHref: l.ctaHref,
});

type Stats = {
  total: number;
  new30: number;
  medianPrice: number | null;
  medianCashFlow: number | null;
};

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

type Group = { id: string; name: string; emoji: string; blurb: string; count: number };

const money = (n?: number | null) =>
  n == null
    ? "—"
    : n.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      });

export async function getServerSideProps() {
  // Every active listing in the feed (vending_listings_merge: cleaned in the DB) - a few dozen rows.
  const { data, error } = await supabase
    .from("vending_listings_merge")
    .select("listing_id,title,description,city,state,price,cash_flow,listing_url,first_seen,days_on_market,broker_account");
  const rows = data ?? [];

  const since30 = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const stats: Stats = {
    total: rows.length,
    new30: rows.filter((r: any) => (r.first_seen || '') >= since30).length,
    medianPrice: median(rows.map((r: any) => r.price).filter((v: any) => v > 0)),
    medianCashFlow: median(rows.map((r: any) => r.cash_flow).filter((v: any) => v > 0)),
  };

  // Per-group counts for "Browse by type" (same classifier as /listings tabs)
  const groupCounts = countByCategory(rows as any[]);
  const groups: Group[] = VENDING_CATEGORIES.filter((c) => c.vending).map((c) => ({
    id: c.id, name: c.name, emoji: c.emoji, blurb: c.blurb, count: groupCounts[c.id] || 0,
  }));

  // Top 10: listings with a price AND reported cash flow first, newest first; then the
  // rest of the priced listings, newest first. No hand-curation claimed - it's a rule.
  const priced = rows.filter((r: any) => r.price);
  const byNew = (a: any, b: any) => (b.first_seen || '').localeCompare(a.first_seen || '');
  const ranked = [
    ...priced.filter((r: any) => r.cash_flow).sort(byNew),
    ...priced.filter((r: any) => !r.cash_flow).sort(byNew),
  ].slice(0, 10);
  const top10: Top10[] = ranked.map((r: any) => ({
    listing_id: r.listing_id != null ? String(r.listing_id) : null,
    title: r.title ?? null,
    city: r.city ?? null,
    state: r.state ?? null,
    price: r.price ?? null,
    revenue: null,
    cash_flow: r.cash_flow ?? null,
    listing_url: r.listing_url ?? null,
    first_seen: r.first_seen ?? null,
    days_on_market: r.days_on_market ?? null,
    broker: brokerName(r.broker_account) || null,
  }));

  const [ours, sold] = await Promise.all([getOurListings(), getOurSoldListings()]);

  return {
    props: {
      top10,
      stats,
      groups,
      ours: ours.map(toOurs),
      sold: sold.map(toOurs),
      errorAuto: error?.message || null,
    },
  };
}

export default function Home({
  top10,
  stats,
  groups,
  ours,
  sold,
  errorAuto,
}: {
  top10: Top10[];
  stats: Stats;
  groups: Group[];
  ours: Ours[];
  sold: Ours[];
  errorAuto?: string | null;
}) {
  return (
    <>
      <Head>
        <title>{`Vending Businesses For Sale — ${stats.total} Routes & Machine Businesses | Vending Exits`}</title>
        <meta name="description" content="Find profitable vending machine businesses for sale. Browse snack and beverage routes, micro markets, bulk, water and ice, air and vacuum, and amusement vending businesses." />
      </Head>

      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero */}
        <header className="text-center mb-10">
          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight">
            Vending Exits
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-800 font-semibold max-w-3xl mx-auto">
            {stats.total} vending businesses for sale
          </p>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-lg">
            Every vending route and machine business we can find on broker websites, checked daily.
            Bread and snack distribution routes and broker ads filtered out.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/valuation" className="rounded-xl bg-amber-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-amber-700 transition">
              What&apos;s my vending business worth? →
            </Link>
            <Link href="/listings" className="rounded-xl border border-amber-600 px-6 py-3 text-amber-700 font-semibold hover:bg-amber-50 transition">
              Browse all {stats.total} listings
            </Link>
          </div>
        </header>

        {/* Our own listings, then our track record */}
        {ours.length > 0 && (
          <section className="mb-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-xl font-bold text-gray-900">Exclusive VendingExits listings</h2>
              <span className="text-sm text-gray-500">Brokered by us · NDA for the full details</span>
            </div>
            <div className="space-y-3">
              {ours.map((l) => (
                <div key={l.id} className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Exclusive</span>
                    {l.status === 'under_loi' && <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full font-bold">Under LOI</span>}
                    <Link href={`/listing/${l.id}`} className="block mt-1 text-lg font-bold text-gray-900 hover:underline">{l.title}</Link>
                    <div className="mt-1 text-sm text-gray-600 flex flex-wrap gap-x-4">
                      <span>Asking <span className="font-semibold text-gray-900">{money(l.price)}</span></span>
                      {l.cash_flow != null && <span>Cash flow <span className="font-semibold text-gray-900">{money(l.cash_flow)}</span></span>}
                      {l.location && <span>{l.location}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/listing/${l.id}`} className="px-4 py-2 rounded-lg border border-amber-600 text-amber-700 font-semibold text-sm">View listing</Link>
                    <a href={l.ctaHref} className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold text-sm">Sign NDA</a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {sold.length > 0 && (
          <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Recently sold by VendingExits</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              {sold.map((l) => (
                <li key={l.id}>
                  <span className="font-semibold">{l.title}</span>
                  {l.price != null && <span className="text-gray-500"> · asking {money(l.price)}</span>}
                  <span className="ml-2 text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full font-bold">SOLD</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-gray-600">
              Thinking about selling? <Link href="/valuation" className="text-amber-700 font-semibold">Get a free, confidential valuation →</Link>
            </p>
          </section>
        )}

        {/* EMAIL CAPTURE */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-3 text-white shadow-md max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">Weekly Top 10 by email</h2>
                <p className="text-xs opacity-90">The newest vending listings with real numbers, every Monday.</p>
              </div>
              
              <Link
                href="/subscribe"
                className="bg-white text-amber-600 font-semibold px-5 py-2 rounded-lg hover:bg-gray-50 transition text-sm whitespace-nowrap"
              >
                Subscribe →
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="mb-10">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-amber-600">{stats.total}</div>
                <div className="text-sm text-gray-600 mt-1">Listings for sale</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-amber-600">{stats.new30}</div>
                <div className="text-sm text-gray-600 mt-1">New in the last 30 days</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-amber-600">{money(stats.medianPrice)}</div>
                <div className="text-sm text-gray-600 mt-1">
                  Median asking{stats.medianCashFlow ? ` · ${money(stats.medianCashFlow)} median cash flow` : ''}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Browse by type */}
        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Browse by Type</h2>
          <p className="text-gray-600 mb-6">The main kinds of vending businesses buyers look for.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {groups.map((g) => {
              const isAirVac = g.id === 'air-vac';
              const href = g.count > 0 ? `/listings?category=${g.id}` : isAirVac ? '#air-vac' : '/sell';
              return (
                <Link
                  key={g.id}
                  href={href}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 hover:border-amber-300 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl" aria-hidden>{g.emoji}</span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-700">
                      {g.count} {g.count === 1 ? 'listing' : 'listings'}
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold text-gray-900 group-hover:text-amber-700">{g.name}</h3>
                  <p className="mt-1 text-sm text-gray-600">{g.blurb}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-amber-600">
                    {g.count > 0 ? 'Browse →' : 'Selling one? Get a valuation →'}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Top 10 */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
            Top <span className="text-yellow-500">10</span>: newest listings with real numbers
          </h2>
          <p className="-mt-4 mb-6 text-sm text-gray-500">Listings that report cash flow come first, newest first.</p>

          <ol className="space-y-4">
            {(!top10 || top10.length === 0) && (
              <div className="rounded-2xl border p-6 text-gray-600">
                {errorAuto ? (
                  <>Couldn&apos;t load Top 10. {errorAuto}</>
                ) : (
                  <>No listings to show yet. Check back shortly.</>
                )}
              </div>
            )}

            {top10?.map((d, i) => (
              <li
                key={i}
                className="rounded-2xl border border-gray-200 p-5 hover:shadow-md hover:border-amber-200 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1 h-10 w-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-lg">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                      <Link
                        href={d.listing_id ? `/listing/${d.listing_id}` : d.listing_url ?? "#"}
                        className="text-lg md:text-xl font-bold hover:text-amber-600 transition"
                      >
                        {d.title ?? "Untitled"}
                      </Link>
                    </div>

                    {(d.city || d.state) && (
                      <div className="text-gray-600 text-sm mb-3">
                        📍 {d.city ? `${d.city}, ` : ""}{d.state ?? ""}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 mb-3 text-sm font-semibold">
                      <div>
                        <span className="text-gray-500">Price</span>{" "}
                        <span className="text-gray-900">{money(d.price)}</span>
                      </div>
                      {d.cash_flow && (
                        <div>
                          <span className="text-gray-500">Cash flow</span>{" "}
                          <span className="text-amber-600">{money(d.cash_flow)}</span>
                        </div>
                      )}
                      {d.revenue && (
                        <div>
                          <span className="text-gray-500">Revenue</span>{" "}
                          <span className="text-gray-900">{money(d.revenue)}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      {d.days_on_market != null && <>Listed {d.days_on_market === 0 ? 'today' : `${d.days_on_market} days ago`}</>}
                      {d.broker && <> · via {d.broker}</>}
                    </div>

                    <Link
                      href={d.listing_id ? `/listing/${d.listing_id}` : d.listing_url ?? "#"}
                      className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold text-sm"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p className="font-semibold">Checked daily against broker websites</p>
          </div>
        </section>

        {/* Air & Vac sellers (campaign landing: vendingexits.com/#air-vac) */}
        <section id="air-vac" className="mt-12 scroll-mt-24">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-6 md:p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  <span aria-hidden>🌬️</span> Air &amp; Vac
                </div>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-gray-900">
                  Own air &amp; vacuum machines? Find out what your route is worth.
                </h2>
                <p className="mt-3 text-gray-700">
                  Tire inflation and coin-op vacuum routes at gas stations, c-stores and car washes
                  sell like any other vending route: on locations, contracts and steady cash flow.
                  We put them in front of buyers who know the model.
                </p>
                <ul className="mt-5 space-y-2 text-sm text-gray-800">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">✓</span>
                    <span>Free, confidential valuation, no listing commitment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">✓</span>
                    <span>Buyers sign an NDA before they see your locations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">✓</span>
                    <span>From the team behind 200+ ATM route sales worth $100M+</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 md:p-8 border-t md:border-t-0 md:border-l border-amber-200">
                <h3 className="text-lg font-bold mb-1">Get your free valuation</h3>
                <p className="text-sm text-gray-600 mb-4">We&apos;ll follow up within one business day.</p>
                <InquiryForm mode="seller" accent="amber" tag="Air & Vac" />
              </div>
            </div>
          </div>
        </section>

        {/* Trust Sections */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="rounded-2xl border border-gray-200 p-6 bg-white">
            <h3 className="font-bold text-lg mb-2">The Vending Index</h3>
            <p className="text-gray-600 mb-4">
              Browse all {stats.total} vending business listings, with how long each has been listed and a link to the broker.
            </p>
            <Link
              href="/listings"
              className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold"
            >
              View full index →
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6 bg-white">
            <h3 className="font-bold text-lg mb-2">Why Trust VendingExits?</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Listings read from broker websites, checked daily</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Deduplicated; broker ads and bread/snack distribution routes filtered out</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Weekly Top 10 email: newest listings with real numbers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">✓</span>
                <span>Direct broker relationships</span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
