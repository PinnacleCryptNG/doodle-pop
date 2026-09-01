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
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse'
          : 'flex flex-col gap-4 animate-pulse'
      }
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-3xl border border-white/10 bg-[#1A1B2F]/60 backdrop-blur-xl p-5 flex flex-col justify-between h-48 shadow-lg"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-white/10 rounded-xl"></div>
              <div className="h-4 w-12 bg-white/5 rounded-xl"></div>
            </div>
            <div className="h-5 w-3/4 bg-white/10 rounded-xl mb-3"></div>
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-white/5 rounded-lg"></div>
              <div className="h-3.5 w-5/6 bg-white/5 rounded-lg"></div>
            </div>
          </div>
          <div className="pt-3 border-t border-white/10 flex justify-between">
            <div className="h-3 w-28 bg-white/10 rounded-lg"></div>
            <div className="h-3 w-14 bg-white/5 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

