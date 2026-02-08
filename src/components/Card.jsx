import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  onClick, 
  className = '',
  hoverable = true,
  pressable = true,
  glassEffect = false
}) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverable ? { scale: 1.01, y: -2 } : {}}
      whileTap={pressable ? { scale: 0.99 } : {}}
      className={`
        rounded-2xl p-6 transition-all duration-200
        ${glassEffect ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm' : 'bg-white dark:bg-slate-800'}
        ${onClick ? 'cursor-pointer' : ''}
        shadow-md hover:shadow-lg
        border border-slate-100 dark:border-slate-700
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
