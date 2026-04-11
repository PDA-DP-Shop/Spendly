import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NFCGlow({ active, color = 'emerald' }) {
  const isEmerald = color === 'emerald';
  const primaryColor = isEmerald ? 'rgba(16, 185, 129, 0.4)' : 'rgba(124, 111, 247, 0.4)';
  const secondaryColor = isEmerald ? 'rgba(16, 185, 129, 0.1)' : 'rgba(124, 111, 247, 0.1)';

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-x-0 top-0 z-[100] pointer-events-none flex justify-center h-40 overflow-hidden">
          {/* Central Beam */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 160, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="w-40 blur-[40px] rounded-b-full bg-gradient-to-b from-white to-transparent"
            style={{ background: `linear-gradient(to bottom, ${primaryColor}, transparent)` }}
          />

          {/* Pulse Waves (iPhone style) */}
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 2], opacity: [0.5, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut"
              }}
              className="absolute top-0 w-32 h-32 rounded-full blur-[20px]"
              style={{ background: secondaryColor }}
            />
          ))}

          {/* Sparkles / Particles */}
          <motion.div
            animate={{ y: [0, 100], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 w-1 h-20 bg-white/40 blur-[2px] rounded-full"
          />
        </div>
      )}
    </AnimatePresence>
  );
}
