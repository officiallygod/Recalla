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
        ${glassEffect ? 'glass' : 'bg-white'}
        ${onClick ? 'cursor-pointer' : ''}
        shadow-lg shadow-slate-200/50
        border border-slate-100
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
