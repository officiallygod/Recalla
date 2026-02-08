import React from 'react';

// Modern SVG icon components
export const TargetIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#EF4444" opacity="0.2"/>
    <circle cx="32" cy="32" r="20" fill="#EF4444" opacity="0.4"/>
    <circle cx="32" cy="32" r="12" fill="#EF4444" opacity="0.6"/>
    <circle cx="32" cy="32" r="4" fill="#EF4444"/>
  </svg>
);

export const GameControllerIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="20" width="48" height="24" rx="12" fill="#6B7280" opacity="0.3"/>
    <rect x="8" y="20" width="48" height="24" rx="12" stroke="#6B7280" strokeWidth="2"/>
    <circle cx="20" cy="32" r="3" fill="#6B7280"/>
    <circle cx="44" cy="32" r="3" fill="#6B7280"/>
    <rect x="30" y="26" width="4" height="4" rx="1" fill="#6B7280"/>
    <rect x="30" y="34" width="4" height="4" rx="1" fill="#6B7280"/>
    <rect x="26" y="30" width="4" height="4" rx="1" fill="#6B7280"/>
    <rect x="34" y="30" width="4" height="4" rx="1" fill="#6B7280"/>
  </svg>
);

export const BooksIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="16" width="14" height="36" rx="2" fill="#EF4444" opacity="0.8"/>
    <rect x="28" y="12" width="14" height="40" rx="2" fill="#3B82F6" opacity="0.8"/>
    <rect x="44" y="18" width="14" height="34" rx="2" fill="#10B981" opacity="0.8"/>
    <line x1="19" y1="24" x2="19" y2="48" stroke="white" strokeWidth="1" opacity="0.5"/>
    <line x1="35" y1="20" x2="35" y2="48" stroke="white" strokeWidth="1" opacity="0.5"/>
    <line x1="51" y1="26" x2="51" y2="48" stroke="white" strokeWidth="1" opacity="0.5"/>
  </svg>
);

export const ChartBarsIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="32" width="8" height="20" rx="2" fill="#10B981"/>
    <rect x="24" y="24" width="8" height="28" rx="2" fill="#3B82F6"/>
    <rect x="36" y="16" width="8" height="36" rx="2" fill="#8B5CF6"/>
    <rect x="48" y="28" width="8" height="24" rx="2" fill="#F59E0B"/>
  </svg>
);

export const StarIcon = ({ className = "w-6 h-6", filled = false }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

export const CoinIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#F59E0B" stroke="#D97706" strokeWidth="2"/>
    <circle cx="12" cy="12" r="7" fill="#FBBF24" opacity="0.5"/>
    <text x="12" y="16" fontSize="12" fontWeight="bold" fill="#92400E" textAnchor="middle">$</text>
  </svg>
);

export const TrophyIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M12 20v-6M8 20h8"/>
    <path d="M7.8 9h8.4c.8 0 1.4.6 1.6 1.4l1 5c.2.8-.4 1.6-1.2 1.6H7.4c-.8 0-1.4-.8-1.2-1.6l1-5C7.4 9.6 8 9 7.8 9z"/>
  </svg>
);

export const SunIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

export const MoonIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
