import React from 'react';
import { SortOption } from '../types';
import { Search, X, Pin, ArrowUpDown, LayoutGrid, List } from 'lucide-react';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  onlyPinned: boolean;
  onToggleOnlyPinned: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (m: 'grid' | 'list') => void;
  totalNotes: number;
  filteredCount: number;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onlyPinned,
  onToggleOnlyPinned,
  viewMode,
  onViewModeChange,
  totalNotes,
  filteredCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
      {/* Search Input Bar */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          id="notes-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes by title or content..."
          className="w-full pl-9 pr-8 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 dark:focus:ring-stone-100/10 focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {/* Pinned filter toggle */}
        <button
          id="filter-pinned-button"
          onClick={onToggleOnlyPinned}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
            onlyPinned
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300'
              : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700'
          }`}
        >
          <Pin className={`w-3.5 h-3.5 ${onlyPinned ? 'fill-current' : ''}`} />
          <span>Pinned Only</span>
        </button>

        {/* Sort selector dropdown */}
        <div className="relative inline-flex items-center">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-stone-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
          </div>
          <select
            id="notes-sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="pl-8 pr-8 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900/10 appearance-none cursor-pointer hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
          >
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
            <option value="updated_desc">Recently Updated</option>
            <option value="title_asc">Title (A-Z)</option>
          </select>
        </div>

        {/* View mode toggle (Grid vs List) */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => onViewModeChange('grid')}
            title="Grid view"
            className={`p-1.5 rounded-md text-stone-600 dark:text-stone-300 cursor-pointer transition-colors ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                : 'hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            title="List view"
            className={`p-1.5 rounded-md text-stone-600 dark:text-stone-300 cursor-pointer transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                : 'hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notes counter badge */}
        <span className="text-xs text-stone-500 dark:text-stone-400 pl-1 whitespace-nowrap">
          {searchQuery ? `${filteredCount} of ${totalNotes}` : `${totalNotes} ${totalNotes === 1 ? 'note' : 'notes'}`}
        </span>
      </div>
    </div>
  );
};
