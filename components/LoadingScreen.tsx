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
      className="fixed inset-0 z-50 bg-[#0D0E12] flex flex-col items-center justify-center"
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
          className="absolute inset-0 blur-3xl bg-amber-500/10 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <h1 className="relative font-cinzel text-5xl md:text-7xl font-bold text-[#F5F5F5] tracking-[0.2em]">
          SCRAPO
        </h1>
      </motion.div>

      {/* Loading bar */}
      <div className="w-64 md:w-80 h-[2px] bg-white/5 rounded-full overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-amber-200/50 to-transparent rounded-full"
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
        className="mt-6 font-courier text-[10px] text-white/40 tracking-widest uppercase font-bold"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {Math.floor(progress)}%
      </motion.p>

      {/* Subtitle */}
      <motion.p
        className="mt-4 font-playfair italic text-[#F5F5F5]/40 text-sm tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 2 }}
      >
        Initializing visual syntax...
      </motion.p>
    </motion.div>
  );
}