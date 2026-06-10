// components/CategoryTabs.tsx
'use client';

import React from 'react';
import { VENDING_CATEGORIES } from '../lib/vendingCategories';

interface CategoryTabsProps {
  /** Currently selected category id, or 'all' */
  active: string;
  /** Count per category id, plus `all` */
  counts: { all: number; categories: Record<string, number> };
  onSelect: (categoryId: string) => void;
  loading?: boolean;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  active,
  counts,
  onSelect,
  loading,
}) => {
  const Pill = ({
    id,
    emoji,
    label,
    count,
  }: {
    id: string;
    emoji: string;
    label: string;
    count?: number;
  }) => {
    const isActive = active === id;
    return (
      <button
        onClick={() => onSelect(id)}
        className={[
          'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
            : 'bg-white border-gray-200 text-gray-800 hover:border-amber-300 hover:bg-amber-50',
        ].join(' ')}
      >
        <span aria-hidden>{emoji}</span>
        <span>{label}</span>
        {typeof count === 'number' && (
          <span
            className={[
              'rounded-full px-2 py-0.5 text-xs font-bold',
              isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600',
            ].join(' ')}
          >
            {loading ? '…' : count.toLocaleString()}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="mb-6 -mx-1 overflow-x-auto pb-2">
      <div className="flex items-center gap-3 px-1">
        <Pill id="all" emoji="🏪" label="All" count={counts.all} />
        {VENDING_CATEGORIES.map((cat) => (
          <Pill
            key={cat.id}
            id={cat.id}
            emoji={cat.emoji}
            label={cat.name}
            count={counts.categories[cat.id]}
          />
        ))}
      </div>
    </div>
  );
};
