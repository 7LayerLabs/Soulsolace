import React from 'react';
import { ReligionOption } from '../types';
import { Icon } from './Icon';

interface ReligionCardProps {
  option: ReligionOption;
  onClick: (option: ReligionOption) => void;
  isSelected: boolean;
}

export const ReligionCard: React.FC<ReligionCardProps> = ({ option, onClick, isSelected }) => {
  return (
    <button
      onClick={() => onClick(option)}
      className={`
        relative overflow-hidden group p-6 rounded-2xl border transition-all duration-300
        flex flex-col gap-4 h-full
        ${isSelected
          ? 'border-indigo-600 bg-white shadow-2xl scale-[1.02] z-20'
          : 'glass-card glass-card-hover'
        }
      `}
    >
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center transition-colors
        ${option.color}
      `}>
        <Icon name={option.icon} className="w-6 h-6" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">{option.name}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{option.description}</p>
      </div>

      {isSelected && (
        <div className="absolute top-4 right-4 text-indigo-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
};
