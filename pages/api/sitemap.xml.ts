// pages/api/sitemap.xml.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

// Lowercase, and must match the host the 308 redirect points at.
// Mixed case here is why Google couldn't fetch the old sitemap.
const BASE_URL = 'https://vendingexits.com';

// Only routes that actually exist in pages/. A URL that 404s wastes
// crawl budget, so verify before adding to this list.
// Deliberately excluded: /vending-index (now redirects to /listings),
// /confirm and /unsubscribe (transactional), /vertical-demo (internal),
// and every cleaning-* route (leftovers from the cleaningexits fork).
const STATIC_PAGES: Array<[string, string, string]> = [
  ['/',          'daily',   '1.0'],
  ['/listings',  'daily',   '0.9'],
  ['/top10',     'daily',   '0.9'],
  ['/resources', 'weekly',  '0.8'],
  ['/sell',      'monthly', '0.7'],
  ['/about',     'monthly', '0.6'],
  ['/contact',   'monthly', '0.6'],
  ['/subscribe', 'monthly', '0.5'],
  ['/privacy',   'yearly',  '0.3'],
  ['/terms',     'yearly',  '0.3'],
];

const urlEntry = (loc: string, lastmod: string, cf: string, pr: string) =>
  `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${cf}</changefreq>
    <priority>${pr}</priority>
  </url>`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // vending_listings_merge is a view in the dealledger project.
    // The old code queried cleaning_listings_merge, which doesn't exist
    // there — it failed silently and emitted zero listing URLs.
    const { data: listings, error } = await supabase
      .from('vending_listings_merge')
      .select('listing_id, scraped_at')
      .eq('is_active', true);

    if (error) throw error;

    const entries: string[] = STATIC_PAGES.map(([path, cf, pr]) =>
      urlEntry(BASE_URL + path, today, cf, pr)
    );

    for (const l of listings || []) {
      if (!l.listing_id) continue;
      const lastmod = l.scraped_at
        ? new Date(l.scraped_at).toISOString().slice(0, 10)
        : today;
      entries.push(
        urlEntry(`${BASE_URL}/listing/${l.listing_id}`, lastmod, 'weekly', '0.7')
      );
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    res.status(200).send(sitemap);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}