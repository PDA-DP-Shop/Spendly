import React from 'react';
import { motion } from 'framer-motion';

export const Shimmer = ({ className = "" }) => (
  <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear',
      }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
    />
  </div>
);

export const TextShimmer = ({ className = "h-4 w-32" }) => (
  <Shimmer className={`rounded-full ${className}`} />
);

export default Shimmer;
