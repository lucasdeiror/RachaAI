import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Ícone Emblemático */}
      <div className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-br from-[#18181D] to-[#0A0A0C] border border-[#27272A] flex items-center justify-center p-1.5 shadow-lg group overflow-hidden`}>
        <div className="absolute inset-0 bg-[#FACC15]/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Corpo do Copo / Caneco */}
          <path
            d="M 23 18 L 41 18 L 38 46 C 38 49, 36 51, 32 51 C 28 51, 26 49, 26 46 Z"
            fill="#202026"
            stroke="#FFFFFF"
            strokeOpacity="0.75"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Cerveja / Chopp Amber */}
          <path
            d="M 24.5 27 L 39.5 27 L 37.5 45 C 37.5 47, 35 48.5, 32 48.5 C 29 48.5, 26.5 47, 26.5 45 Z"
            fill="url(#logoInnerGold)"
            fillOpacity="0.9"
          />
          {/* Raio / Corte de Divisão Elétrico (Racha) */}
          <line x1="47" y1="15" x2="17" y2="47" stroke="#FACC15" strokeWidth="4.5" strokeLinecap="round" />
          {/* Faíscas de Brinde (Pontos de Divisão ÷) */}
          <circle cx="42" cy="24" r="3.5" fill="#FACC15" />
          <circle cx="20" cy="36" r="3.5" fill="#FACC15" />
          <defs>
            <linearGradient id="logoInnerGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Tipografia */}
      <div className="flex flex-col">
        <span className={`font-mono font-black tracking-wider text-white ${textSizes[size]} leading-none`}>
          RACHA<span className="text-[#FACC15] drop-shadow-[0_0_12px_rgba(250,204,21,0.4)]">AI</span>
        </span>
        {showSubtitle && (
          <span className="text-[9px] font-semibold text-[#A1A1AA] tracking-widest uppercase mt-0.5">
            Divisão Inteligente
          </span>
        )}
      </div>
    </div>
  );
};
