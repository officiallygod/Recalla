import React from 'react';
import { hapticMedium } from '../utils/haptic';

const Card = React.memo(({ 
  children, 
  onClick, 
  className = ''
}) => {
  const handleClick = (e) => {
    if (onClick) {
      // Trigger haptic feedback on card click
      hapticMedium();
      onClick(e);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        rounded-lg p-4 transition-all duration-200
        bg-white dark:bg-slate-900
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
