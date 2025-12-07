"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

/**
 * Premium Loading Screen with animated progress bar
 */
export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 10;
        const next = prev + increment;
        
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-sepia-dark flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: progress >= 100 ? 0 : 1 }}
      transition={{ duration: 1 }}
    >
      {/* Logo */}
      <motion.div
        className="relative mb-8"
        animate={{
          y: [0, -10, 0],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 blur-2xl bg-faded-gold/40 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <h1 className="relative font-cinzel text-5xl md:text-7xl font-bold text-faded-gold tracking-wider">
          SCRAPO
        </h1>
      </motion.div>

      {/* Loading bar */}
      <div className="w-64 md:w-80 h-2 bg-faded-gold/20 rounded-full overflow-hidden shadow-lg">
        <motion.div
          className="h-full bg-gradient-to-r from-faded-gold via-cherry-red to-faded-gold rounded-full"
          style={{ width: `${progress}%` }}
          initial={{ x: "-100%" }}
          animate={{ 
            x: "0%",
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            x: { duration: 0.3 },
            backgroundPosition: {
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        />
      </div>

      {/* Percentage */}
      <motion.p
        className="mt-4 font-sans text-sm text-faded-gold/80 tracking-widest"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {Math.floor(progress)}%
      </motion.p>

      {/* Subtitle */}
      <motion.p
        className="mt-8 font-playfair italic text-vintage-paper/60 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Preparing your canvas...
      </motion.p>
    </motion.div>
  );
}