import React, { useState } from 'react';
import { DOODLEPOP_LOGO } from '../assets/logo';
import { Sparkles, Edit3, Stars } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  alt?: string;
  animated?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8 rounded-xl',
  md: 'w-10 h-10 rounded-2xl',
  lg: 'w-14 h-14 rounded-2xl',
  xl: 'w-20 h-20 rounded-3xl',
  '2xl': 'w-28 h-28 rounded-3xl',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  alt = 'DoodlePop Mascot',
  animated = true,
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative inline-block ${animated ? 'group' : ''}`}>
      {/* Dynamic Cosmic Back-glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#38BDF8] via-[#C084FC] to-[#FACC15] rounded-3xl blur-md opacity-60 group-hover:opacity-100 group-hover:blur-lg transition-all duration-500 animate-pulse-glow" />

      {/* Main Mascot Badge Frame */}
      <div
        className={`relative overflow-hidden shrink-0 border-2 border-white/25 shadow-[0_0_25px_rgba(56,189,248,0.35)] bg-gradient-to-tr from-[#1A1B2F] via-[#241B3F] to-[#121324] flex items-center justify-center transition-transform duration-300 ${
          animated ? 'group-hover:scale-105 group-hover:rotate-1' : ''
        } ${sizeMap[size]} ${className}`}
      >
        {!hasError ? (
          <img
            src={DOODLEPOP_LOGO}
            alt={alt}
            className={`w-full h-full object-cover select-none ${animated ? 'animate-float' : ''}`}
            loading="eager"
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#38BDF8] via-[#C084FC] to-[#FACC15] flex items-center justify-center text-slate-950 font-black">
            <Sparkles className="w-1/2 h-1/2 text-white animate-spin" />
          </div>
        )}

        {/* Playful Floating Sparkle Badge for larger sizes */}
        {(size === 'lg' || size === 'xl' || size === '2xl') && (
          <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow-lg border border-white/40 animate-bounce">
            <Sparkles className="w-3 h-3 fill-amber-950" />
          </div>
        )}
      </div>
    </div>
  );
};

