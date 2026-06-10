// components/ListingsGrid.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ListingCard } from './ListingCard';
import { SearchFilters } from './SearchFilters';
import { Pagination } from './Pagination';
import { CategoryTabs } from './CategoryTabs';
import { VENDING_CATEGORIES } from '@/lib/vendingCategories';

interface ListingsResponse {
  listings: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

type Counts = { all: number; categories: Record<string, number> };

const emptyCounts: Counts = {
  all: 0,
  categories: Object.fromEntries(VENDING_CATEGORIES.map((c) => [c.id, 0])),
};

export const ListingsGrid: React.FC = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [counts, setCounts] = useState<Counts>(emptyCounts);
  const [countsLoading, setCountsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    sortBy: 'ingested_at',
    sortOrder: 'desc',
  });

  const fetchCounts = async () => {
    setCountsLoading(true);
    try {
      const res = await fetch('/api/listings?counts=true');
      if (res.ok) {
        const data = await res.json();
        setCounts({ all: data.all || 0, categories: data.categories || {} });
      }
    } catch {
      // counts are non-critical; leave at zero
    } finally {
      setCountsLoading(false);
    }
  };

  const fetchListings = async (
    currentFilters = filters,
    page = 1,
    category = activeCategory
  ) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(currentFilters).filter(([_, value]) => value !== '')
        ),
      });
      if (category && category !== 'all') params.set('category', category);

      const response = await fetch(`/api/listings?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }

      const data: ListingsResponse = await response.json();
      setListings(data.listings);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    fetchListings(newFilters, 1, activeCategory);
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    fetchListings(filters, 1, categoryId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (page: number) => {
    fetchListings(filters, page, activeCategory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeName =
    activeCategory === 'all'
      ? 'Vending Businesses'
      : VENDING_CATEGORIES.find((c) => c.id === activeCategory)?.name ||
        'Vending Businesses';

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchListings()}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{activeName}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse {pagination.total.toLocaleString()} verified vending listings, updated daily
          </p>
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          active={activeCategory}
          counts={counts}
          onSelect={handleCategorySelect}
          loading={countsLoading}
        />

        <SearchFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-96 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600 mb-6">
              {activeCategory === 'all'
                ? 'Try adjusting your search criteria or filters'
                : `No listings in ${activeName} yet — try another category or clear filters`}
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                handleFilterChange({
                  search: '',
                  minPrice: '',
                  maxPrice: '',
                  location: '',
                  sortBy: 'ingested_at',
                  sortOrder: 'desc',
                });
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()} listings
              </p>
              <div className="text-sm text-gray-500">
                Updated {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.surrogate_key || listing.listNumber || listing.specificId} listing={listing} />
              ))}
            </div>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              hasNext={pagination.hasNext}
              hasPrev={pagination.hasPrev}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};
