"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * FloatingElements - Ambient background animation
 * Petals, hearts, and lyric snippets float across the screen
 */
export default function FloatingElements() {
  const [elements, setElements] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const lyrics = [
      "Summertime sadness",
      "Blue jeans, white shirt",
      "Kiss me hard before you go",
      "Heaven is a place on earth",
      "Live fast, die young",
      "Diamonds are forever",
      "Young and beautiful",
      "Video games",
      "Born to die",
      "Lust for life",
    ];

    const elementCount = typeof window !== "undefined" && window.innerWidth <= 768 ? 10 : 20;

    const newElements = Array.from({ length: elementCount }).map((_, i) => {
      const rand = Math.random();
      const type = rand < 0.4 ? "petal" : rand < 0.7 ? "heart" : "lyric";
      const size = 8 + Math.random() * 15;
      const duration = 8 + Math.random() * 15;
      const delay = Math.random() * 10;
      const left = Math.random() * 100;

      if (type === "petal") {
        return (
          <motion.div
            key={`petal-${i}`}
            className="absolute rounded-full blur-sm"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              background: `rgba(247, 202, 201, ${0.4 + Math.random() * 0.4})`,
            }}
            initial={{ y: "100vh", rotate: 0, opacity: 0 }}
            animate={{
              y: "-100px",
              rotate: 360,
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      }

      if (type === "heart") {
        return (
          <motion.div
            key={`heart-${i}`}
            className="absolute text-vintage-red"
            style={{
              fontSize: size,
              left: `${left}%`,
              textShadow: "0 0 8px rgba(247, 202, 201, 0.8)",
            }}
            initial={{ y: "100vh", rotate: 0, opacity: 0 }}
            animate={{
              y: "-100px",
              rotate: 360,
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            ♥
          </motion.div>
        );
      }

      // Lyric
      return (
        <motion.div
          key={`lyric-${i}`}
          className="absolute font-playfair italic text-sepia-dark whitespace-nowrap"
          style={{
            fontSize: 10 + Math.random() * 6,
            left: `${left}%`,
            textShadow: "1px 1px 3px rgba(232, 223, 200, 0.8)",
          }}
          initial={{ y: "100vh", opacity: 0 }}
          animate={{
            y: "-100px",
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {lyrics[Math.floor(Math.random() * lyrics.length)]}
        </motion.div>
      );
    });

    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements}
    </div>
  );
}