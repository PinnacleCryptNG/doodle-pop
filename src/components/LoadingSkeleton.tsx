import React from 'react';

interface LoadingSkeletonProps {
  viewMode: 'grid' | 'list';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ viewMode }) => {
  const count = viewMode === 'grid' ? 6 : 4;

  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse'
          : 'flex flex-col gap-3 animate-pulse'
      }
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 flex flex-col justify-between h-44"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 w-24 bg-stone-200 dark:bg-stone-800 rounded"></div>
              <div className="h-4 w-12 bg-stone-100 dark:bg-stone-850 rounded"></div>
            </div>
            <div className="h-5 w-3/4 bg-stone-200 dark:bg-stone-800 rounded mb-2.5"></div>
            <div className="space-y-1.5">
              <div className="h-3.5 w-full bg-stone-100 dark:bg-stone-850 rounded"></div>
              <div className="h-3.5 w-5/6 bg-stone-100 dark:bg-stone-850 rounded"></div>
            </div>
          </div>
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-between">
            <div className="h-3 w-28 bg-stone-100 dark:bg-stone-850 rounded"></div>
            <div className="h-3 w-14 bg-stone-100 dark:bg-stone-850 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
