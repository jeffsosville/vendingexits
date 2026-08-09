// data/ourListings.ts
//
// In-house (VendingExits-brokered) listings.
//
// WHY THIS FILE EXISTS
// The public listing grid reads `vending_listings_merge` out of the DealLedger
// Supabase project, which is a READ-ONLY public warehouse of scraped market
// data. Our own brokered listings must never be written into it  -  DealLedger's
// value is that it is a neutral registry. So our listings live here, in git,
// and get merged into the grid at request time.
//
// MIGRATION PATH
// When the application database (ATM CRM project) has a `listings` table with
// a `vertical` column, `getOurListings()` becomes an async Supabase query
// against that project and every consumer below is unchanged.

export type OurListingFinancial = {
  label: string;
  value: string;
  note?: string;
};

export type OurListing = {
  /** URL slug  -  this is what /listing/[id] resolves on */
  id: string;
  listing_id: string;
  source: 'inhouse';
  status: 'active' | 'under_loi' | 'sold';
  is_active: boolean;

  /** ListingCard reads `header`; detail page reads `title`. Keep both. */
  header: string;
  title: string;

  price: number | null;
  /** ListingCard reads camelCase; detail page reads snake_case. Keep both. */
  cashFlow: number | null;
  cash_flow: number | null;

  city: string | null;
  state: string | null;
  location: string | null;
  category: string | null;

  summary: string;
  highlights: string[];
  financials: OurListingFinancial[];
  equipment: string[];

  machineCount: number | null;
  locationTypes: string | null;
  hoursPerWeek: string | null;

  listedOn: string; // ISO date
  first_seen: string;
  listing_url: string;

  /**
   * Primary CTA on the detail page. Point this at `/nda?listing=<id>` once
   * `pages/nda.tsx` is installed  -  until then it stays a mailto so the button
   * is never dead.
   */
  ctaHref: string;
  ctaLabel: string;

  /**
   * The `atm_deals.id` in the ATM CRM project that this listing maps to.
   * The NDA still records without it, but the buyer's Deal Hub renders empty,
   * so set it once after creating the deal in the CRM.
   */
  crmDealId: string | null;

  broker: {
    name: string;
    firm: string;
    email: string;
    phone: string;
  };
};

export const OUR_LISTINGS: OurListing[] = [
  {
    id: 'longmont-co-vending-route',
    listing_id: 'longmont-co-vending-route',
    source: 'inhouse',
    status: 'active',
    is_active: true,

    header: 'Longmont, CO  -  4-Machine Vending Route',
    title: 'Longmont, CO  -  4-Machine Vending Route',

    price: 120000,
    cashFlow: 28839,
    cash_flow: 28839,

    city: 'Longmont',
    state: 'CO',
    location: 'Longmont, CO',
    category: 'Vending Route',

    summary:
      'A four-machine vending route operating in and around Longmont, Colorado, placed ' +
      'in manufacturing locations. Three machines are currently deployed and one is held ' +
      'in storage as a spare or for a fifth placement. All equipment is identical and was ' +
      'purchased new in 2026, so there is no deferred maintenance to inherit. The current ' +
      'owner runs it alongside other work with limited weekly hours.',

    highlights: [
      'Four identical machines  -  three deployed, one in storage for a future placement',
      'Manufacturing locations (captive daytime workforce, predictable weekday traffic)',
      'Equipment purchased new in 2026  -  no deferred maintenance',
      'Cashless payment processing in place, so revenue is verifiable from processor data',
      'Owner-operated on a part-time basis alongside other work',
    ],

    financials: [
      { label: 'Asking price', value: '$120,000' },
      { label: 'Monthly net cash flow', value: '$2,403' },
      { label: 'Annual net cash flow', value: '$28,839' },
    ],

    equipment: [
      '4 x identical vending machines (three deployed, one in storage)',
      'Cashless / card readers on deployed machines',
      'Frigidaire 20 cu. ft. freezerless refrigerator for product pre-cooling (purchased March 2026)',
    ],


    machineCount: 4,
    locationTypes: 'Manufacturing',
    hoursPerWeek: 'Part-time  -  owner operates it alongside other work',

    listedOn: '2026-08-08',
    first_seen: '2026-08-08',
    listing_url: '/listing/longmont-co-vending-route',

    ctaHref: '/nda?listing=longmont-co-vending-route',
    ctaLabel: 'Sign NDA & Get Access >',

    // TODO: paste the atm_deals.id for this route once the CRM deal exists.
    crmDealId: null,

    broker: {
      name: 'John Sosville',
      firm: 'VendingExits',
      email: 'sales@vendingexits.com',
      phone: '888-430-5535',
    },
  },
];

/**
 * All active in-house listings, newest first.
 * Swap the body for a Supabase query when the application DB is ready.
 */
export function getOurListings(): OurListing[] {
  return OUR_LISTINGS.filter((l) => l.is_active && l.status !== 'sold').sort(
    (a, b) => (a.listedOn < b.listedOn ? 1 : -1)
  );
}

export function getOurListingById(id: string): OurListing | null {
  return OUR_LISTINGS.find((l) => l.id === id || l.listing_id === id) || null;
}

/**
 * Apply the same filters the API applies to warehouse rows, so an in-house
 * listing disappears from the grid when it doesn't match the active search  - 
 * rather than sitting there pinned and looking broken.
 */
export function filterOurListings(
  listings: OurListing[],
  opts: {
    search?: string | null;
    minPrice?: string | null;
    maxPrice?: string | null;
    location?: string | null;
  }
): OurListing[] {
  return listings.filter((l) => {
    if (opts.search) {
      const q = opts.search.toLowerCase();
      const hay = `${l.title} ${l.location ?? ''} ${l.city ?? ''} ${l.state ?? ''} ${l.category ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (opts.minPrice && (l.price ?? 0) < parseInt(opts.minPrice, 10)) return false;
    if (opts.maxPrice && (l.price ?? 0) > parseInt(opts.maxPrice, 10)) return false;
    if (opts.location) {
      const loc = (l.location ?? '').toLowerCase();
      if (!loc.includes(opts.location.toLowerCase())) return false;
    }
    return true;
  });
}
