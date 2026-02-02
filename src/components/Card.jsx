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
      whileHover={hoverable ? { scale: 1.02, y: -2 } : {}}
      whileTap={pressable ? { scale: 0.98 } : {}}
      className={`
        rounded-2xl p-6 transition-all duration-200
        ${glassEffect ? 'glass' : 'bg-white dark:bg-slate-800'}
        ${onClick ? 'cursor-pointer' : ''}
        shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50
        border border-slate-100 dark:border-slate-700
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
