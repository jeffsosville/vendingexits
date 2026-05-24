import { VerticalConfig } from '../types';

/**
 * Vending Machine Businesses Vertical Configuration
 */
export const vendingVertical: VerticalConfig = {
  info: {
    name: 'Vending Businesses',
    slug: 'vending',
    domain: 'VendingExits.com',
    brandColor: '#D97706',
    logoPath: '/logos/vending-logo.svg',
    faviconPath: '/favicons/vending-favicon.ico',
  },

  seo: {
    metaTitle: 'Vending Machine Businesses for Sale | {{name}}',
    metaDescription:
      'Find profitable vending machine businesses and routes for sale. Browse snack, beverage, combo, micro-market, and specialty vending operations. Verified listings with financial details.',
    keywords: [
      'vending business for sale',
      'vending machine business for sale',
      'vending route for sale',
      'vending machine route',
      'snack vending business',
      'beverage vending business',
      'micro market business for sale',
      'vending company acquisition',
      'coin operated business for sale',
      'amusement vending business',
    ],
    ogImage: '/og-images/vending-og.jpg',
    twitterCard: 'summary_large_image',
  },

  categories: [
    { id: 'snack', name: 'Snack Vending', description: 'Snack and food vending machine routes', icon: 'package' },
    { id: 'beverage', name: 'Beverage Vending', description: 'Cold drink and beverage vending operations', icon: 'coffee' },
    { id: 'combo', name: 'Combo & Full-Line', description: 'Combination snack and beverage routes', icon: 'layers' },
    { id: 'micro-market', name: 'Micro Markets', description: 'Self-checkout micro-market installations', icon: 'shopping-cart' },
    { id: 'amusement', name: 'Amusement & Coin-Op', description: 'Arcade, gaming, and coin-operated amusement machines', icon: 'star' },
    { id: 'specialty', name: 'Specialty Vending', description: 'Novelty, toy, water, and other specialty vending', icon: 'sparkles' },
  ],

  valuationMultiples: {
    revenueMin: 0.5, revenueMax: 1.2, revenueMedian: 0.8,
    sdeMin: 1.5, sdeMax: 3.0, sdeMedian: 2.25,
    ebitdaMin: 2.5, ebitdaMax: 4.5, ebitdaMedian: 3.5,
  },

  brokerSources: [
    { name: 'BizBuySell', url: 'https://www.bizbuysell.com/businesses-for-sale/vending-businesses/', active: true, scraperConfig: { rateLimit: 30 } },
    { name: 'BizQuest', url: 'https://www.bizquest.com/businesses-for-sale/vending/', active: true, scraperConfig: { rateLimit: 20 } },
    { name: 'BusinessBroker.net', url: 'https://www.businessbroker.net/businesses-for-sale/vending-coin-operated/', active: false },
  ],

  emailTemplates: {
    welcome: {
      subject: 'Welcome to VendingExits - Your Vending Business Marketplace',
      headerText: 'Welcome to VendingExits!',
      ctaText: 'Browse Vending Businesses',
    },
    weeklyTop10: {
      subject: 'Top 10 Vending Businesses This Week | VendingExits',
      headerText: "This Week's Top Vending Business Opportunities",
      introText:
        'Here are the most promising vending businesses listed this week. Each has been verified and includes detailed financial information.',
    },
    newListing: { subject: 'New Vending Business Listed: {{businessName}}', headerText: 'New Opportunity Alert' },
    priceChange: { subject: 'Price Reduced: {{businessName}}', headerText: 'Price Drop Alert' },
    fromEmail: 'listings@VendingExits.com',
    fromName: 'VendingExits',
  },

  terminology: {
    businessTerm: 'Vending Business',
    businessTermPlural: 'Vending Businesses',
    revenueTerm: 'Annual Revenue',
    profitTerm: 'SDE',
    customMetrics: [
      { key: 'machineCount', label: 'Machines', description: 'Number of vending machines', format: 'number' },
      { key: 'locationCount', label: 'Locations', description: 'Number of placement locations', format: 'number' },
      { key: 'recurringRevenue', label: 'Recurring Revenue %', description: 'Percentage of revenue from recurring placements', format: 'percentage' },
      { key: 'routeType', label: 'Route Type', description: 'Snack, Beverage, Combo, or Specialty', format: 'text' },
    ],
  },

  custom: {
    filters: {
      serviceArea: ['Urban', 'Suburban', 'Rural', 'Multi-location'],
      equipmentIncluded: true,
      vehiclesIncluded: true,
    },
  },
};
