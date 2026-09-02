import React, { useState } from 'react';
import { DOODLEPOP_LOGO } from '../assets/logo';
import { Layers } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  alt?: string;
  animated?: boolean;
  onClick?: () => void;
}

const sizeMap = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-14 h-14 rounded-xl',
  xl: 'w-20 h-20 rounded-2xl',
  '2xl': 'w-28 h-28 rounded-2xl',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  alt = 'DoodlePop Logo',
  animated = false,
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`relative inline-block ${onClick ? 'cursor-pointer' : ''}`}
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
    >
      {/* Main Mascot Badge Frame */}
      <div
        className={`relative overflow-hidden shrink-0 border border-slate-700/70 shadow-xs bg-[#181A24] flex items-center justify-center transition-transform duration-200 ${
          onClick ? 'hover:border-sky-500/60 active:scale-95' : ''
        } ${animated ? 'hover:scale-105' : ''} ${sizeMap[size]} ${className}`}
      >
        {!hasError ? (
          <img
            src={DOODLEPOP_LOGO}
            alt={alt}
            className="w-full h-full object-cover select-none"
            loading="eager"
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#181A24] flex items-center justify-center text-sky-400 font-bold">
            <Layers className="w-1/2 h-1/2 text-sky-400" />
          </div>
        )}
      </div>
    </div>
  );
};


