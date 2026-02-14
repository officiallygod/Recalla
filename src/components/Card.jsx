import React from 'react';
import { hapticMedium } from '../utils/haptic';

const Card = React.memo(({ 
  children, 
  onClick, 
  className = '',
  glassEffect = false,
  pressable = false,
  hoverable = false
}) => {
  const handleClick = (e) => {
    if (onClick) {
      // Trigger haptic feedback on card click
      hapticMedium();
      onClick(e);
    }
  };

  const baseClasses = glassEffect
    ? 'card-glass'
    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm';

  const interactClasses = (onClick || pressable)
    ? 'cursor-pointer active:scale-[0.98]'
    : '';

  const hoverClasses = hoverable
    ? 'hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-1'
    : '';

  return (
    <div
      onClick={handleClick}
      className={`
        rounded-2xl p-4
        transition-all duration-200 ease-out
        ${baseClasses}
        ${interactClasses}
        ${hoverClasses}
        ${className}
      `}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
