"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  className?: string;
}

/**
 * Typewriter Effect Component - Streams text character by character
 * with a blinking red cursor (Ghost Writer Mode)
 */
export default function TypewriterText({
  text,
  speed = 50,
  onComplete,
  className = "",
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  return (
    <div className={`relative ${className}`}>
      {/* The text content */}
      <span
        className="font-courier leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: displayedText.replace(/\n/g, "<br>"),
        }}
      />

      {/* Blinking cursor */}
      {!isComplete && (
        <motion.span
          className="inline-block w-[2px] h-5 bg-cherry-red ml-1"
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </div>
  );
}