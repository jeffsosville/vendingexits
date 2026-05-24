// pages/about.tsx
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function About() {
  return (
    <>
      <Head>
        <title>About | Vending Exits</title>
        <meta name="description" content="Vending Exits is the most comprehensive database of vending machine businesses for sale. No franchises, no BS." />
      </Head>

      <Header />

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">About Vending Exits</h1>
        
        <div className="space-y-8">
          {/* CREDIBILITY BANNER */}
          <div className="bg-gradient-to-r from-blue-50 to-amber-50 rounded-xl p-6 border-2 border-blue-200">
            <h2 className="text-2xl font-bold mb-3">Why Trust VendingExits?</h2>
            <p className="text-gray-700 mb-4">
              VendingExits is brought to you by the team behind <strong>ATM Brokerage</strong>, where we've 
              successfully facilitated <strong>200+ transactions totaling over $100M</strong> in ATM businesses 
              since 2012. We achieved 90% market share in ATM brokerage through transparent data, verified 
              listings, and direct broker relationships.
            </p>
            <p className="text-gray-700">
              Now we're bringing that same expertise and marketplace approach to vending machine businesses - 
              cutting through the noise to show you real, verified opportunities.
            </p>
          </div>

          <div className="bg-white rounded-xl border p-8">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              Finding a legitimate vending machine business to buy is harder than it should be. 
              Most marketplaces are cluttered with franchises, dead listings, and overpriced routes.
            </p>
            <p className="text-gray-700 mb-4">
              We built Vending Exits to solve that problem.
            </p>
            <p className="text-gray-700">
              We aggregate listings from hundreds of brokers, verify the data, filter out the noise, 
              and deliver only real vending opportunities to serious buyers.
            </p>
          </div>

          <div className="bg-white rounded-xl border p-8">
            <h2 className="text-2xl font-bold mb-4">What Makes Us Different</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-xl">✓</span>
                <div>
                  <strong>No Franchises</strong> - Only independently owned vending routes
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-xl">✓</span>
                <div>
                  <strong>Real Routes Only</strong> - No equipment sales or single-machine schemes
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-xl">✓</span>
                <div>
                  <strong>Verified & Updated</strong> - We check listings daily
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-xl">✓</span>
                <div>
                  <strong>Comprehensive</strong> - Hundreds of verified listings from trusted sources
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-xl">✓</span>
                <div>
                  <strong>No Lead-Gen BS</strong> - Real listings from real brokers
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-600 font-bold text-xl">✓</span>
                <div>
                  <strong>Proven Track Record</strong> - Built by the team that dominated ATM brokerage
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border p-8">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">1. We Aggregate</h3>
                <p className="text-gray-700">
                  Our system monitors hundreds of business brokers and marketplaces daily, 
                  capturing every new vending machine business listing.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">2. We Filter</h3>
                <p className="text-gray-700">
                  We automatically remove franchises, equipment-only sales, and other businesses 
                  that don't meet our criteria for real vending routes.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">3. We Verify</h3>
                <p className="text-gray-700">
                  Each listing is checked for accuracy and completeness. Dead listings are removed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">4. We Deliver</h3>
                <p className="text-gray-700">
                  Every week, we curate the Top 10 best opportunities and send them to our subscribers. 
                  Plus, you get access to our full index of verified vending route listings.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-200 p-8">
            <h2 className="text-2xl font-bold mb-4">Who We Help</h2>
            <div className="space-y-3">
              <p className="text-gray-700">
                <strong>Buyers:</strong> Entrepreneurs, searchers, and investors looking for 
                profitable vending businesses without wasting time on junk listings or franchise schemes.
              </p>
              <p className="text-gray-700">
                <strong>Sellers:</strong> Vending route owners who want exposure to serious, 
                qualified buyers willing to pay fair market value.
              </p>
              <p className="text-gray-700">
                <strong>Brokers:</strong> Professionals who want their quality vending listings in 
                front of our growing audience of cash-flow buyers.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-8">
            <h2 className="text-2xl font-bold mb-4">Get Started</h2>
            <p className="text-gray-700 mb-6">
              Join buyers who trust Vending Exits to find their next acquisition.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/subscribe"
                className="inline-block px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition"
              >
                Subscribe to Weekly Top 10
              </Link>
              <Link
                href="/vending-index"
                className="inline-block px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Browse All Listings
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="text-amber-600 hover:text-amber-700 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
