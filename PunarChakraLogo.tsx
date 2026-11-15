import React from 'react';
import logoImg from '../assets/images/punarchakra_logo_1785891011537.jpg';

interface PunarChakraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'light' | 'dark';
  className?: string;
}

export const PunarChakraLogo: React.FC<PunarChakraLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  variant = 'light',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-18',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="relative group shrink-0">
        <div
          className={`absolute -inset-0.5 rounded-xl blur-xs transition duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 opacity-60 group-hover:opacity-90'
              : 'bg-emerald-300/40 opacity-0 group-hover:opacity-100'
          }`}
        />
        <img
          src={logoImg}
          alt="PunarChakra Official Logo"
          referrerPolicy="no-referrer"
          className={`relative ${sizeClasses[size]} w-auto object-contain rounded-xl shadow-md border ${
            isDark ? 'border-emerald-400/40 bg-white' : 'border-emerald-200 bg-white'
          } p-1 transition-transform group-hover:scale-105`}
        />
      </div>
      {showSubtitle && (
        <div className="text-left">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`font-black tracking-tight font-display text-lg sm:text-xl ${
                isDark ? 'text-white drop-shadow-xs' : 'text-emerald-950'
              }`}
            >
              PunarChakra
            </span>
            <span
              className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full border ${
                isDark
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              ಪುನಃಚಕ್ರ
            </span>
          </div>
          <p
            className={`text-[10px] font-bold tracking-tight ${
              isDark ? 'text-emerald-300/90' : 'text-slate-500'
            }`}
          >
            Giving Waste a New Life • ತ್ಯಾಜ್ಯಕ್ಕೆ ಹೊಸ ಜೀವನ
          </p>
        </div>
      )}
    </div>
  );
};

