import React, { useState, useRef, MouseEvent } from 'react';
import { ReligionOption } from '../types';
import { Icon } from './Icon';

interface RippleStyle {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface ReligionCardProps {
  option: ReligionOption;
  onClick: (option: ReligionOption) => void;
  isSelected: boolean;
  index?: number;
}

// Map religion colors to gradient overlays
const colorGradients: Record<string, string> = {
  'bg-blue-100': 'from-blue-500/0 via-blue-500/5 to-blue-500/10',
  'bg-emerald-100': 'from-emerald-500/0 via-emerald-500/5 to-emerald-500/10',
  'bg-indigo-100': 'from-indigo-500/0 via-indigo-500/5 to-indigo-500/10',
  'bg-orange-100': 'from-orange-500/0 via-orange-500/5 to-orange-500/10',
  'bg-amber-100': 'from-amber-500/0 via-amber-500/5 to-amber-500/10',
  'bg-purple-100': 'from-purple-500/0 via-purple-500/5 to-purple-500/10',
};

const getGradientFromColor = (colorClass: string): string => {
  for (const [key, gradient] of Object.entries(colorGradients)) {
    if (colorClass.includes(key)) {
      return gradient;
    }
  }
  return 'from-slate-500/0 via-slate-500/5 to-slate-500/10';
};

export const ReligionCard: React.FC<ReligionCardProps> = ({ option, onClick, isSelected, index = 0 }) => {
  const [ripples, setRipples] = useState<RippleStyle[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Create ripple effect
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const newRipple: RippleStyle = {
        left: x,
        top: y,
        width: size,
        height: size,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 600);
    }

    onClick(option);
  };

  const gradientClass = getGradientFromColor(option.color);
  const staggerDelay = index * 50; // 50ms stagger per card

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden group p-4 sm:p-6 rounded-xl sm:rounded-2xl border transition-all duration-300
        flex flex-col gap-3 sm:gap-4 h-full ripple-container card-shine animate-fade-in-up
        ${isSelected
          ? 'border-indigo-600 bg-white shadow-2xl scale-[1.02] z-20'
          : 'glass-card glass-card-hover'
        }
      `}
      style={{
        animationDelay: `${staggerDelay}ms`,
      }}
    >
      {/* Hover gradient overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-100' : ''}`}
      />

      {/* Ripple effects */}
      {ripples.map((ripple, idx) => (
        <span
          key={idx}
          className="ripple"
          style={{
            left: ripple.left,
            top: ripple.top,
            width: ripple.width,
            height: ripple.height,
          }}
        />
      ))}

      {/* Icon with glow effect on hover */}
      <div className={`
        relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300
        ${option.color}
        ${isHovered ? 'shadow-lg scale-110' : ''}
      `}>
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-full blur-md transition-opacity duration-300 ${option.color} ${isHovered ? 'opacity-50' : 'opacity-0'}`}
        />
        <Icon name={option.icon} className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
      </div>

      <div className="relative z-10 flex-1">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-0.5 sm:mb-1">{option.name}</h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{option.description}</p>
      </div>

      {/* Arrow indicator on hover */}
      <div
        className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
      >
        <Icon name="ChevronRight" className="w-5 h-5 text-slate-400" />
      </div>

      {isSelected && (
        <div className="absolute top-4 right-4 text-indigo-600 z-10">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};
