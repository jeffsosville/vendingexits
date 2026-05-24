// pages/resources.tsx
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Resources() {
  return (
    <>
      <Head>
        <title>Resources | Vending Exits</title>
        <meta name="description" content="Guides and resources for buying and selling vending machine businesses." />
      </Head>

      <Header />

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">Vending Business Resources</h1>
        
        <div className="bg-white rounded-xl border p-8 mb-8">
          {/* CREDIBILITY BANNER */}
          <div className="bg-gradient-to-r from-blue-50 to-amber-50 rounded-xl p-6 border-2 border-blue-200 mb-8">
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

          <p className="text-lg text-gray-700 mb-8">
            Everything you need to know about buying and selling vending machine businesses.
          </p>

          <div className="space-y-8">
            {/* For Buyers */}
            <div>
              <h2 className="text-2xl font-bold mb-4">For Buyers</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">What to Look For</h3>
                  <p className="text-gray-700 mb-3">
                    When evaluating a vending business acquisition, focus on:
                  </p>
                  <ul className="text-gray-700 space-y-1 ml-4">
                    <li>• <strong>Location quality</strong> - High-traffic locations = consistent revenue</li>
                    <li>• <strong>Contract terms</strong> - Longer lease agreements reduce risk</li>
                    <li>• <strong>Machine condition</strong> - Age and maintenance history matter</li>
                    <li>• <strong>Route density</strong> - Tighter routes = better margins and efficiency</li>
                    <li>• <strong>Product mix</strong> - Diversified offerings (snacks, drinks, combo) perform better</li>
                    <li>• <strong>Commission structure</strong> - Lower location commissions = higher profits</li>
                  </ul>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Typical Valuation Multiples</h3>
                  <p className="text-gray-700 mb-3">
                    Vending machine businesses typically sell for:
                  </p>
                  <ul className="text-gray-700 space-y-1 ml-4">
                    <li>• <strong>2.0-3.0x annual net cash flow</strong> for smaller routes (under 20 machines)</li>
                    <li>• <strong>2.5-3.5x annual net cash flow</strong> for mid-size portfolios (20-50 machines)</li>
                    <li>• <strong>3.0-4.0x annual net cash flow</strong> for larger established routes (50+ machines)</li>
                    <li>• <strong>Premium multiples</strong> for specialty vending (healthy, micro-markets, specialty items)</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2">
                    *Multiples vary based on location quality, machine condition, contract length, and growth potential
                  </p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Key Metrics to Analyze</h3>
                  <p className="text-gray-700 mb-3">
                    Understand these critical numbers:
                  </p>
                  <ul className="text-gray-700 space-y-1 ml-4">
                    <li>• <strong>Revenue per machine per month</strong> - Industry average: $250-500</li>
                    <li>• <strong>Net profit margin</strong> - Should be 25-35% after all expenses</li>
                    <li>• <strong>Commission percentage</strong> - Lower is better (aim for under 20%)</li>
                    <li>• <strong>Service frequency</strong> - Fewer visits = better efficiency</li>
                    <li>• <strong>Product cost ratio</strong> - Should be around 30-35% of gross sales</li>
                  </ul>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Financing Your Purchase</h3>
                  <p className="text-gray-700 mb-3">
                    Most buyers finance 70-90% of the purchase price through:
                  </p>
                  <ul className="text-gray-700 space-y-1 ml-4">
                    <li>• <strong>SBA 7(a) loans</strong> - Up to 90% LTV, 10-year terms</li>
                    <li>• <strong>Seller financing</strong> - Often 10-20% of purchase price</li>
                    <li>• <strong>Equipment financing</strong> - For machines and vehicles</li>
                    <li>• <strong>Business lines of credit</strong> - For inventory and working capital</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-3">
                    Need financing? We work with SBA lenders who specialize in vending business acquisitions.{' '}
                    <Link href="/contact" className="text-amber-600 hover:underline">Contact us</Link> for an intro.
                  </p>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Due Diligence Checklist</h3>
                  <p className="text-gray-700 mb-3">Before you buy, verify:</p>
                  <ul className="text-gray-700 space-y-1 ml-4">
                    <li>• Location contracts (terms, renewal history, commission rates)</li>
                    <li>• Revenue reports by machine and location (12-24 months)</li>
                    <li>• Machine inventory (age, condition, manufacturer, warranty status)</li>
                    <li>• Route map and service schedule</li>
                    <li>• Vendor agreements and pricing</li>
                    <li>• Insurance policies and claims history</li>
                    <li>• Vehicle condition and maintenance records</li>
                    <li>• Outstanding liabilities or legal issues</li>
                    <li>• Location concentration risk (top 3 locations = what % of revenue?)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* For Sellers */}
            <div>
              <h2 className="text-2xl font-bold mb-4">For Sellers</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Preparing Your Business for Sale</h3>
                  <p className="text-gray-700 mb-3">
                    Maximize your sale price by:
                  </p>
                  <ul className="text-gray-700 space-y-1 ml-4">
                    <li>• <strong>Document everything</strong> - Revenue reports, location contracts, machine inventory</li>
                    <li>• <strong>Extend contracts</strong> - Renew location agreements before selling</li>
                    <li>• <strong>Service machines</strong> - Update equipment, fix issues, clean thoroughly</li>
                    <li>• <strong>Optimize routes</strong> - Tighter routes = more attractive to buyers</li>
                    <li>• <strong>Show growth potential</strong> - Identify underperforming locations with upside</li>
                    <li>• <strong>Clean financials</strong> - 2-3 years of profit/loss statements by location</li>
                  </ul>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">When to Sell</h3>
                  <p className="text-gray-700 mb-3">
                    The best time to sell is when:
                  </p>
                  <ul className="text-gray-700 space-y-1 ml-4">
                    <li>• Revenue is stable or growing (shows strength)</li>
                    <li>• All locations have active contracts (reduces buyer risk)</li>
                    <li>• Machines are in good working condition (less deferred maintenance)</li>
                    <li>• You have a compelling story about growth opportunities</li>
                    <li>• Market conditions are favorable (low interest rates help buyers finance)</li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    Want to sell your vending business?{' '}
                    <Link href="/sell" className="text-amber-600 hover:underline font-semibold">
                      Learn more →
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Market Insights */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Market Insights</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Industry Trends</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• <strong>Cashless payment adoption</strong> - Card readers and mobile payments are becoming standard</li>
                    <li>• <strong>Healthier options demand</strong> - Premium for machines offering healthy snacks and drinks</li>
                    <li>• <strong>Micro-markets emerging</strong> - Unattended retail spaces in office buildings</li>
                    <li>• <strong>Remote monitoring</strong> - Smart machines with telemetry reduce service costs</li>
                    <li>• <strong>Consolidation wave</strong> - Larger operators acquiring smaller routes</li>
                  </ul>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">What Buyers Want Most</h3>
                  <ul className="text-gray-700 space-y-1 ml-4">
                    <li>• Routes with 20-100 machines (sweet spot for owner-operators)</li>
                    <li>• High-traffic locations with long-term contracts</li>
                    <li>• Newer machines with cashless payment capability</li>
                    <li>• Low commission rates to locations (under 20%)</li>
                    <li>• Seller willing to provide training and transition support</li>
                    <li>• Geographically concentrated routes (lower fuel/time costs)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Common Vending Types</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• <strong>Snack machines</strong> - Chips, candy, crackers (lowest maintenance)</li>
                    <li>• <strong>Beverage machines</strong> - Sodas, water, sports drinks (higher revenue per machine)</li>
                    <li>• <strong>Combo machines</strong> - Snacks + drinks (most popular, best revenue)</li>
                    <li>• <strong>Specialty machines</strong> - Ice cream, hot food, healthy options (premium pricing)</li>
                    <li>• <strong>Micro-markets</strong> - Open shelving with self-checkout (highest revenue per location)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Why Vending Makes Sense */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Why Vending Businesses?</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Benefits of Vending Business Ownership</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• <strong>Flexible schedule</strong> - Service machines on your own time</li>
                    <li>• <strong>Scalable</strong> - Add locations and machines as you grow</li>
                    <li>• <strong>Recession-resistant</strong> - People always need snacks and drinks</li>
                    <li>• <strong>Asset-backed</strong> - Machines have tangible resale value</li>
                    <li>• <strong>Low labor</strong> - Owner-operator model with minimal employees</li>
                    <li>• <strong>Cash flow positive</strong> - Collect cash/card payments immediately</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-2">Have Questions?</h3>
            <p className="text-gray-700 mb-4">
              Whether you're buying or selling, we're here to help. Get our weekly insights 
              and the Top 10 deals every Monday.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/subscribe"
                className="inline-block px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition"
              >
                Subscribe Now
              </Link>
              <Link
                href="/contact"
                className="inline-block px-6 py-3 bg-white text-amber-600 border-2 border-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-amber-600 hover:text-amber-700 font-semibold">
            ← Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}
