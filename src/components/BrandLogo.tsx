import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  alt?: string;
  animated?: boolean;
  onClick?: () => void;
}

const sizeConfig = {
  sm: {
    container: 'w-8 h-8 rounded-lg',
    iconSize: 'text-xl',
  },
  md: {
    container: 'w-10 h-10 rounded-xl',
    iconSize: 'text-2xl',
  },
  lg: {
    container: 'w-14 h-14 rounded-2xl',
    iconSize: 'text-3xl',
  },
  xl: {
    container: 'w-20 h-20 rounded-2xl',
    iconSize: 'text-5xl',
  },
  '2xl': {
    container: 'w-28 h-28 rounded-3xl',
    iconSize: 'text-7xl',
  },
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  alt = 'DoodlePop Notebook',
  animated = false,
  onClick,
}) => {
  const current = sizeConfig[size] || sizeConfig.md;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 ${
        onClick ? 'cursor-pointer' : ''
      }`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      title={alt}
    >
      {/* Notebook Badge Frame */}
      <div
        className={`relative overflow-hidden shrink-0 flex items-center justify-center transition-all duration-200 select-none bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 dark:border-amber-500/30 shadow-2xs ${
          onClick ? 'hover:scale-105 active:scale-95 hover:border-amber-500/50' : ''
        } ${animated ? 'hover:scale-105' : ''} ${current.container} ${className}`}
      >
        <span
          className={`leading-none filter drop-shadow-xs transition-transform duration-200 transform -rotate-3 group-hover:rotate-0 ${current.iconSize}`}
          role="img"
          aria-label="Notebook"
        >
          📒
        </span>
      </div>
    </div>
  );
};
