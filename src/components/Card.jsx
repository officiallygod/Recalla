import React from 'react';

const Card = ({ 
  children, 
  onClick, 
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
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
};

export default Card;
