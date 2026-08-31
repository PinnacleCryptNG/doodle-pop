import React, { useState } from 'react';
import { DOODLEPOP_LOGO } from '../assets/logo';
import { Sparkles, Edit3 } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 rounded-lg',
  md: 'w-8 h-8 rounded-xl',
  lg: 'w-12 h-12 rounded-2xl',
  xl: 'w-20 h-20 rounded-2xl',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  alt = 'DoodlePop Logo',
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden shrink-0 border border-[#2DD4BF]/40 shadow-[0_0_15px_rgba(45,212,191,0.3)] bg-gradient-to-tr from-[#1E1E2E] to-[#121216] flex items-center justify-center ${
        sizeMap[size]
      } ${className}`}
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
        <div className="w-full h-full bg-gradient-to-br from-[#2DD4BF] to-[#F59E0B] flex items-center justify-center text-slate-950 font-bold">
          <Edit3 className="w-1/2 h-1/2" />
        </div>
      )}
    </div>
  );
};
