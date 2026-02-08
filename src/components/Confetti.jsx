import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Confetti = ({ trigger, duration = 1000 }) => {
  const [pieces, setPieces] = useState([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      // Generate confetti pieces
      const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#10b981', '#3b82f6'];
      const newPieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        left: Math.random() * 100,
        delay: Math.random() * 0.3,
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 720 - 360,
      }));
      
      setPieces(newPieces);
      setShow(true);

      const timer = setTimeout(() => {
        setShow(false);
        setPieces([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                top: -20,
                left: `${piece.left}%`,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                top: '100vh',
                opacity: 0,
                rotate: piece.rotation,
              }}
              transition={{
                duration: duration / 1000,
                delay: piece.delay,
                ease: 'easeIn',
              }}
              style={{
                position: 'absolute',
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: '2px',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

export default Confetti;
